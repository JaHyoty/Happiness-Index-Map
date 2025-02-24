DROP PROCEDURE IF EXISTS RecalculateHappinessIndex;

DELIMITER $

CREATE PROCEDURE RecalculateHappinessIndex()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE zipCode VARCHAR(10);
    DECLARE oldHappinessScore DECIMAL(5, 2);
    DECLARE newHappinessScore DECIMAL(5, 2);
    DECLARE stateCode VARCHAR(2);

    DECLARE populationParam DECIMAL(12, 10);
    DECLARE populationDensityParam DECIMAL(12, 10);
    DECLARE medianAgeParam DECIMAL(12, 10);
    DECLARE shareOfMarriedParam DECIMAL(12, 10);
    DECLARE avgFamilySizeParam DECIMAL(12, 10);
    DECLARE unemploymentRateParam DECIMAL(12, 10);
    DECLARE householdMedianIncomeParam DECIMAL(12, 10);
    DECLARE homeOwnershipRateParam DECIMAL(12, 10);
    DECLARE medianHomeValueParam DECIMAL(12, 10);
    DECLARE medianRentParam DECIMAL(12, 10);
    DECLARE shareOfCollegeEducationParam DECIMAL(12, 10);
    DECLARE avgCommuteTimeParam DECIMAL(12, 10);
    DECLARE intercept DECIMAL(12, 10);

    DECLARE zipCursor CURSOR FOR
    SELECT  ComponentHappinessScores.zipCode, totalHappinessScore
    FROM ComponentHappinessScores;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- SELECT zipCode, totalHappinessScore
    -- FROM ComponentHappinessScores;

    DROP TEMPORARY TABLE IF EXISTS TempHappinessChanges;
    DROP TEMPORARY TABLE IF EXISTS Ranks;
    DROP TEMPORARY TABLE IF EXISTS Ranks2;
    DROP TEMPORARY TABLE IF EXISTS Ranks3;
    DROP TEMPORARY TABLE IF EXISTS ImprovedRanks;
    DROP TEMPORARY TABLE IF EXISTS DroppedRanks;

    SELECT
        r.populationParam, r.populationDensityParam, r.medianAgeParam, r.shareOfMarriedParam, r.avgFamilySizeParam, r.unemploymentRateParam,
        r.householdMedianIncomeParam, r.homeOwnershipRateParam, r.medianHomeValueParam, r.medianRentParam, r.shareOfCollegeEducationParam,
        r.avgCommuteTimeParam, r.intercept
    INTO
        populationParam, populationDensityParam, medianAgeParam, shareOfMarriedParam, avgFamilySizeParam, unemploymentRateParam,
        householdMedianIncomeParam, homeOwnershipRateParam, medianHomeValueParam, medianRentParam, shareOfCollegeEducationParam,
        avgCommuteTimeParam, intercept
    FROM RegressionParameters r
    WHERE targetComponentName = 'totalHappinessScore';


    -- SELECT populationParam, populationDensityParam, medianAgeParam, shareOfMarriedParam, avgFamilySizeParam, unemploymentRateParam,
    --     householdMedianIncomeParam, homeOwnershipRateParam, medianHomeValueParam, medianRentParam, shareOfCollegeEducationParam,
    --     avgCommuteTimeParam, intercept;

    CREATE TEMPORARY TABLE TempHappinessChanges (
        stateCode VARCHAR(2),
        zipCode VARCHAR(10),
        oldScore DECIMAL(10, 2),
        newScore DECIMAL(10, 2)
    );

    OPEN zipCursor;


    zipLoop: LOOP
        FETCH zipCursor INTO zipCode, oldHappinessScore;

        -- SELECT zipCode, oldHappinessScore; -- Debugging output

        IF done THEN
            LEAVE zipLoop;
        END IF;

        -- Calculate new happiness score using regression parameters
        SET newHappinessScore = (
            SELECT intercept
                 + (populationParam * z.population)
                 + (populationDensityParam * z.populationDensity)
                 + (medianAgeParam * z.medianAge)
                 + (shareOfMarriedParam * z.shareOfMarried)
                 + (avgFamilySizeParam * z.avgFamilySize)
                 + (unemploymentRateParam * z.unemploymentRate)
                 + (householdMedianIncomeParam * z.householdMedianIncome)
                 + (homeOwnershipRateParam * z.homeOwnershipRate)
                 + (medianHomeValueParam * z.medianHomeValue)
                 + (medianRentParam * z.medianRent)
                 + (shareOfCollegeEducationParam * z.shareOfCollegeEducation)
                 + (avgCommuteTimeParam * z.avgCommuteTime)
            FROM ZipAreas z
            WHERE z.zipCode = zipCode
        );

        SET stateCode = (
            SELECT z.stateCode
            FROM ZipAreas z
            WHERE z.zipCode = zipCode
        );

        INSERT INTO TempHappinessChanges (stateCode, zipCode, oldScore, newScore)
        VALUES (stateCode, zipCode, oldHappinessScore, newHappinessScore);

        UPDATE ComponentHappinessScores c
        SET c.totalHappinessScore = newHappinessScore
        WHERE zipCode = c.zipCode;
    END LOOP;

    CLOSE zipCursor;

    -- SELECT * FROM TempHappinessChanges;

    CREATE TEMPORARY TABLE Ranks AS
    SELECT
        TempHappinessChanges.stateCode,
        TempHappinessChanges.zipCode,
        TempHappinessChanges.oldScore,
        TempHappinessChanges.newScore,
        RANK() OVER (PARTITION BY TempHappinessChanges.stateCode ORDER BY TempHappinessChanges.oldScore DESC) AS oldRank,
        RANK() OVER (PARTITION BY TempHappinessChanges.stateCode ORDER BY TempHappinessChanges.newScore DESC) AS newRank
    FROM TempHappinessChanges;

    -- SELECT * FROM Ranks;

    CREATE TEMPORARY TABLE Ranks2 AS
    SELECT * FROM Ranks;
    
    CREATE TEMPORARY TABLE Ranks3 AS
    SELECT * FROM Ranks;

    CREATE TEMPORARY TABLE ImprovedRanks AS
    SELECT
        Ranks.stateCode,
        Ranks.zipCode,
        Ranks.oldRank,
        Ranks.newRank,
        (CAST(Ranks.oldRank AS SIGNED) - CAST(Ranks.newRank AS SIGNED)) AS rankImprovement
    FROM Ranks
    JOIN (
        SELECT
            Ranks2.stateCode,
            MAX(CAST(Ranks2.oldRank AS SIGNED) - CAST(Ranks2.newRank AS SIGNED)) AS maxRankImprovement
        FROM Ranks2
        GROUP BY Ranks2.stateCode
    ) AS rankDiff
        ON Ranks.stateCode = rankDiff.stateCode
        AND (CAST(Ranks.oldRank AS SIGNED) - CAST(Ranks.newRank AS SIGNED)) = rankDiff.maxRankImprovement
    WHERE NOT EXISTS (
        SELECT 1
        FROM Ranks3 R2
        WHERE Ranks.stateCode = R2.stateCode
        AND (CAST(R2.oldRank AS SIGNED) - CAST(R2.newRank AS SIGNED)) = rankDiff.maxRankImprovement
        AND R2.zipCode < Ranks.zipCode
    )
    ;


    CREATE TEMPORARY TABLE DroppedRanks AS
    SELECT
        Ranks.stateCode,
        Ranks.zipCode,
        Ranks.oldRank,
        Ranks.newRank,
        (CAST(Ranks.newRank AS SIGNED) - CAST(Ranks.oldRank AS SIGNED)) AS rankDrop
    FROM Ranks
    JOIN (
        SELECT
            Ranks2.stateCode,
            MAX(CAST(Ranks2.newRank AS SIGNED) - CAST(Ranks2.oldRank AS SIGNED)) AS maxRankDrop
        FROM Ranks2
        GROUP BY Ranks2.stateCode
    ) AS rankDiff ON 1 = 1
        AND Ranks.stateCode = rankDiff.stateCode
        AND (CAST(newRank AS SIGNED) - CAST(oldRank AS SIGNED)) = rankDiff.maxRankDrop
    WHERE NOT EXISTS (
        SELECT 1
        FROM Ranks3 R2
        WHERE Ranks.stateCode = R2.stateCode
        AND (CAST(R2.oldRank AS SIGNED) - CAST(R2.newRank AS SIGNED)) = rankDiff.maxRankDrop
        AND R2.zipCode < Ranks.zipCode
    )
    ;


    SELECT
        imp.stateCode,
        imp.zipCode AS zipCodeImprovedMost,
        imp.oldRank AS rankImprovedFrom,
        imp.newRank AS rankImprovedTo,
        imp.rankImprovement,
        drp.zipCode AS zipCodeDroppedMost,
        drp.oldRank AS rankDroppedFrom,
        drp.newRank AS rankDroppedTo,
        drp.rankDrop
    FROM ImprovedRanks imp
    JOIN DroppedRanks drp
    ON imp.stateCode = drp.stateCode;

    -- Cleanup temporary table
    DROP TEMPORARY TABLE TempHappinessChanges;
    DROP TEMPORARY TABLE Ranks;
    DROP TEMPORARY TABLE Ranks2;
    DROP TEMPORARY TABLE ImprovedRanks;
    DROP TEMPORARY TABLE DroppedRanks;

END$
DELIMITER ;
