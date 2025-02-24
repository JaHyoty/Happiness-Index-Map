CREATE TRIGGER update_review_access
AFTER INSERT ON HappinessSurveys
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM Users WHERE email = NEW.userEmail AND review_access = 0) THEN
    UPDATE Users
    SET review_access = 1, homeZipCode = NEW.zipCode
    WHERE email = NEW.userEmail;
  END IF;
END;