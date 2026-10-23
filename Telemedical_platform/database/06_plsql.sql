-- Simple PL/SQL procedures. Run with SET SERVEROUTPUT ON to see DBMS_OUTPUT messages.

CREATE OR REPLACE PROCEDURE update_consultation_status (
    p_consultation_id IN consultation.consultation_id%TYPE,
    p_status IN consultation.status%TYPE
) AS
BEGIN
    UPDATE consultation
    SET status = p_status
    WHERE consultation_id = p_consultation_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Consultation ID does not exist.');
    END IF;

    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE add_feedback (
    p_feedback_id IN feedback.feedback_id%TYPE,
    p_patient_id IN feedback.patient_id%TYPE,
    p_feedback_comment IN feedback.feedback_comment%TYPE,
    p_rating IN feedback.rating%TYPE
) AS
BEGIN
    INSERT INTO feedback (feedback_id, patient_id, feedback_comment, rating)
    VALUES (p_feedback_id, p_patient_id, p_feedback_comment, p_rating);

    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE show_patient_consultations (
    p_patient_id IN patient.patient_id%TYPE
) AS
BEGIN
    FOR consultation_row IN (
        SELECT c.consultation_id, c."Date", c.status,
               d.first_name || ' ' || d.last_name AS doctor_name
        FROM consultation c
        INNER JOIN doctor d ON c.doctor_id = d.doctor_id
        WHERE c.patient_id = p_patient_id
        ORDER BY c."Date"
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(
            'Consultation ' || consultation_row.consultation_id ||
            ': ' || consultation_row.doctor_name ||
            ', ' || TO_CHAR(consultation_row."Date", 'DD-MON-YYYY') ||
            ', ' || consultation_row.status
        );
    END LOOP;
END;
/

-- Example calls (uncomment one at a time when demonstrating):
-- BEGIN update_consultation_status(704, 'COMPLETED'); END;
-- /
-- BEGIN add_feedback(605, 3, 'The doctor explained the treatment plan clearly.', 5); END;
-- /
-- BEGIN show_patient_consultations(1); END;
-- /
