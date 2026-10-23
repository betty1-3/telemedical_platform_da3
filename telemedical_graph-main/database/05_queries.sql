-- Predefined academic SELECT queries for the Hospital Management Dashboard.

-- 1. Simple SELECT: list all patients.
SELECT patient_id, first_name, last_name, city
FROM patient;

-- 2. WHERE: patients in Mumbai.
SELECT patient_id, first_name, last_name, area
FROM patient
WHERE city = 'Mumbai';

-- 3. ORDER BY: doctors from most to least experienced.
SELECT doctor_id, first_name, last_name, experience
FROM doctor
ORDER BY experience DESC, last_name ASC;

-- 4. INNER JOIN: consultations with patient and doctor names.
SELECT c.consultation_id, p.first_name || ' ' || p.last_name AS patient_name,
       d.first_name || ' ' || d.last_name AS doctor_name, c."Date", c.status
FROM consultation c
INNER JOIN patient p ON c.patient_id = p.patient_id
INNER JOIN doctor d ON c.doctor_id = d.doctor_id
ORDER BY c."Date";

-- 5. Multiple-table JOIN: completed paid consultations and payment details.
SELECT c.consultation_id, p.first_name || ' ' || p.last_name AS patient_name,
       d.first_name || ' ' || d.last_name AS doctor_name,
       py.payment_amount, py.paid_by
FROM consultation c
INNER JOIN patient p ON c.patient_id = p.patient_id
INNER JOIN doctor d ON c.doctor_id = d.doctor_id
INNER JOIN payment py ON c.consultation_id = py.consultation_id
WHERE c.status = 'COMPLETED';

-- 6. GROUP BY and COUNT: number of consultations handled by each doctor.
SELECT d.doctor_id, d.first_name || ' ' || d.last_name AS doctor_name,
       COUNT(c.consultation_id) AS consultation_count
FROM doctor d
LEFT JOIN consultation c ON d.doctor_id = c.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name
ORDER BY consultation_count DESC;

-- 7. SUM: total payment amount by payment method.
SELECT paid_by, SUM(payment_amount) AS total_received
FROM payment
GROUP BY paid_by
ORDER BY total_received DESC;

-- 8. AVG: average doctor rating by specialization.
SELECT ds.specialization, AVG(dr.rating) AS average_rating
FROM doctor_specialization ds
INNER JOIN doctor_rating dr ON ds.doctor_id = dr.doctor_id
GROUP BY ds.specialization;

-- 9. HAVING: doctors with more than one consultation.
SELECT d.doctor_id, d.first_name || ' ' || d.last_name AS doctor_name,
       COUNT(c.consultation_id) AS consultation_count
FROM doctor d
INNER JOIN consultation c ON d.doctor_id = c.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name
HAVING COUNT(c.consultation_id) > 1;

-- 10. Relationship query: doctors associated with each hospital.
SELECT h.name AS hospital_name, d.first_name || ' ' || d.last_name AS doctor_name,
       hd.role
FROM hospital_doctor hd
INNER JOIN hospital h ON hd.hospital_id = h.hospital_id
INNER JOIN doctor d ON hd.doctor_id = d.doctor_id
ORDER BY h.name, doctor_name;

-- 11. Prescriptions with the medicines prescribed.
SELECT pr.prescription_id, p.first_name || ' ' || p.last_name AS patient_name,
       m.medicine_name, m.medicine_type
FROM prescription pr
INNER JOIN consultation c ON pr.consultation_id = c.consultation_id
INNER JOIN patient p ON c.patient_id = p.patient_id
INNER JOIN prescription_medicine pm ON pr.prescription_id = pm.prescription_id
INNER JOIN medicine m ON pm.medicine_id = m.medicine_id
ORDER BY pr.prescription_id;

-- 12. Patients who have not yet made a payment for a consultation.
SELECT c.consultation_id, p.first_name || ' ' || p.last_name AS patient_name,
       c.status, c."Date"
FROM consultation c
INNER JOIN patient p ON c.patient_id = p.patient_id
LEFT JOIN payment py ON c.consultation_id = py.consultation_id
WHERE py.payment_id IS NULL;
