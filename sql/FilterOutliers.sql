DROP PROCEDURE IF EXISTS FilterOutliers;

DELIMITER $

CREATE PROCEDURE FilterOutliers()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE zipCode VARCHAR(10);
    DECLARE stateCode VARCHAR(2);
    DECLARE totalHappiness DECIMAL(5, 2);
    DECLARE reportedHappiness INT;
    DECLARE avgTotalHappiness DECIMAL(5, 2);
    DECLARE sdTotalHappiness DECIMAL(10, 2);
    DECLARE avgReportedHappiness DECIMAL(5, 2);
    DECLARE sdReportedHappiness DECIMAL(10, 2);
    DECLARE normalizedTotalHappiness DECIMAL(10, 4);
    DECLARE normalizedReportedHappiness DECIMAL(10, 4);
    DECLARE zScoreDifference DECIMAL(10, 4);

    DECLARE zipCursor CURSOR FOR
    SELECT
        za.zipCode,
        za.stateCode,
        chs.totalHappinessScore,
        hss.avgUserReportedHappinessScore
    FROM ComponentHappinessScores chs
    JOIN (
        SELECT
            hs.zipCode,
            AVG(hs.userReportedHappinessScore) AS avgUserReportedHappinessScore
        FROM HappinessSurveys hs
        GROUP BY hs.zipCode
    ) hss
    JOIN ZipAreas za
    ON 1=1
        AND chs.zipCode = hss.zipCode
        AND chs.zipCode = za.zipCode;

    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    START TRANSACTION;

    CREATE TEMPORARY TABLE TotalHappinessStats (
        stateCode CHAR(2),
        avgTotalHappiness DECIMAL(10, 2),
        sdTotalHappiness DECIMAL(10, 2)
    );

    CREATE TEMPORARY TABLE ReportedHappinessStats (
        stateCode CHAR(2),
        avgReportedHappiness DECIMAL(10, 2),
        sdReportedHappiness DECIMAL(10, 2)
    );

    INSERT INTO TotalHappinessStats (stateCode, avgTotalHappiness, sdTotalHappiness)
    SELECT
        z.stateCode,
        AVG(chs.totalHappinessScore) AS avgTotalHappiness,
        STDDEV(chs.totalHappinessScore) AS sdTotalHappiness
    FROM ComponentHappinessScores chs
    JOIN ZipAreas z ON chs.zipCode = z.zipCode
    GROUP BY z.stateCode;


    INSERT INTO ReportedHappinessStats (stateCode, avgReportedHappiness, sdReportedHappiness)
    SELECT
        z.stateCode,
        AVG(hss.score) AS avgReportedHappiness,
        STDDEV(hss.score) AS sdReportedHappiness
    FROM (
        SELECT
            hs.zipCode,
            AVG(hs.userReportedHappinessScore) AS score
        FROM HappinessSurveys hs
        GROUP BY hs.zipCode
    ) hss
    JOIN ZipAreas z ON hss.zipCode = z.zipCode
    GROUP BY z.stateCode;

    DROP TEMPORARY TABLE IF EXISTS Outliers;
    CREATE TEMPORARY TABLE Outliers (
        zipCode VARCHAR(10),
        stateCode VARCHAR(2),
        normalizedTotalHappiness DECIMAL(10, 4),
        normalizedReportedHappiness DECIMAL(10, 4),
        totalHappinessScore DECIMAL(10, 2),
        avgUserReportedHappinessScore DECIMAL(5, 2),
        zScoreDifference DECIMAL(10, 4)
    );

    -- SELECT *
    -- FROM TotalHappinessStats;

    OPEN zipCursor;

    zipLoop: LOOP
        FETCH zipCursor INTO zipCode, stateCode, totalHappiness, reportedHappiness;

        IF done THEN
            LEAVE zipLoop;
        END IF;

        SELECT TotalHappinessStats.avgTotalHappiness, TotalHappinessStats.sdTotalHappiness
        INTO avgTotalHappiness, sdTotalHappiness
        FROM TotalHappinessStats
        WHERE TotalHappinessStats.stateCode = stateCode;

        SELECT ReportedHappinessStats.avgReportedHappiness, ReportedHappinessStats.sdReportedHappiness
        INTO avgReportedHappiness, sdReportedHappiness
        FROM ReportedHappinessStats
        WHERE ReportedHappinessStats.stateCode = stateCode;

        IF sdTotalHappiness = 0 OR sdReportedHappiness = 0 THEN
            ITERATE zipLoop;
        END IF;


        -- SELECT stateCode, avgTotalHappiness, sdTotalHappiness, avgReportedHappiness, sdReportedHappiness;

        
        SET normalizedTotalHappiness = (totalHappiness - avgTotalHappiness) / sdTotalHappiness;
        SET normalizedReportedHappiness = (reportedHappiness - avgReportedHappiness) / sdReportedHappiness;


        SET zScoreDifference = ABS(normalizedTotalHappiness - normalizedReportedHappiness);


        IF zScoreDifference > 2 THEN
            INSERT INTO Outliers (
                zipCode, stateCode, normalizedTotalHappiness, normalizedReportedHappiness,
                totalHappinessScore, avgUserReportedHappinessScore, zScoreDifference
            )
            VALUES (
                zipCode, stateCode, normalizedTotalHappiness, normalizedReportedHappiness,
                totalHappiness, reportedHappiness, zScoreDifference
            );
        END IF;
    END LOOP;

    CLOSE zipCursor;

    SELECT * FROM Outliers;

    COMMIT;


    DROP TEMPORARY TABLE IF EXISTS Outliers;
    DROP TEMPORARY TABLE IF EXISTS TotalHappinessStats;
    DROP TEMPORARY TABLE IF EXISTS ReportedHappinessStats;
END$
DELIMITER ;
