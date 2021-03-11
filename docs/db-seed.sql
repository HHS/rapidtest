SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_ethnicity ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_ethnicity (id, lab_id, short_name, long_name) VALUES (1, null, N'H', N'Hispanic/Latino');
INSERT INTO pennrapidtest.dbo.mod_cvd_ethnicity (id, lab_id, short_name, long_name) VALUES (2, null, N'N', N'Not Hispanic/Latino');
INSERT INTO pennrapidtest.dbo.mod_cvd_ethnicity (id, lab_id, short_name, long_name) VALUES (3, null, N'U', N'Unknown');


SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_ethnicity OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_lab ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_lab (lab_id, name, address1, address2, city, state, zip, latitude, longitude, archive, sftp_host, sftp_user, sftp_pass, admin_email, abbr) VALUES (1, N'TDEM', null, null, null, null, null, null, null, 0, null, null, null, N'', null);



SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_lab OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_mission ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_mission (mission_id, mission_type, archive, send_results, bulk_send_to_hhsc_email) VALUES (1, N'K-12 School', 0, null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_mission (mission_id, mission_type, archive, send_results, bulk_send_to_hhsc_email) VALUES (2, N'Texas Military Department', 0, null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_mission (mission_id, mission_type, archive, send_results, bulk_send_to_hhsc_email) VALUES (3, N'Texas Division of Emergency Managment', 0, null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_mission (mission_id, mission_type, archive, send_results, bulk_send_to_hhsc_email) VALUES (4, N'Nursing Home', 0, null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_mission (mission_id, mission_type, archive, send_results, bulk_send_to_hhsc_email) VALUES (5, N'Public Safety', 0, null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_mission (mission_id, mission_type, archive, send_results, bulk_send_to_hhsc_email) VALUES (6, N'Assisted Living Facility', 0, null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_mission (mission_id, mission_type, archive, send_results, bulk_send_to_hhsc_email) VALUES (7, N'College', 0, null, 0);


SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_mission OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_notes_type ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_notes_type (id, short_name, description) VALUES (1, N'G', N'General Info');
INSERT INTO pennrapidtest.dbo.mod_cvd_notes_type (id, short_name, description) VALUES (2, N'I', N'Issue');
INSERT INTO pennrapidtest.dbo.mod_cvd_notes_type (id, short_name, description) VALUES (3, N'R', N'Result Information');
INSERT INTO pennrapidtest.dbo.mod_cvd_notes_type (id, short_name, description) VALUES (4, N'M', N'MD Notes');
INSERT INTO pennrapidtest.dbo.mod_cvd_notes_type (id, short_name, description) VALUES (5, N'N', N'Notification');


SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_notes_type OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_race ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (1, 6, N'C', N'White / Caucasian');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (2, 6, N'B', N'Black or African American ');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (3, 6, N'I', N'American Indian or Alaskan Native   ');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (4, 6, N'A', N'Asian');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (5, 6, N'P', N'Native Hawaiian or Other Pacific Islander        ');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (6, 6, N'O', N'Other Race');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (7, 6, N'X', N'Race Not Indicated  ');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (8, 6, N'J', N'Ashkenazi Jewish');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (9, 6, N'S', N'Sephardic Jewish');
INSERT INTO pennrapidtest.dbo.mod_cvd_race (id, lab_id, short_name, long_name) VALUES (10, 6, N'H', N'Hispanic');


SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_race OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_result_type ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_result_type (result_type_id, result_type, result_value, archive, lab_id) VALUES (1, N'Negative', N'negative', 0, null);
INSERT INTO pennrapidtest.dbo.mod_cvd_result_type (result_type_id, result_type, result_value, archive, lab_id) VALUES (2, N'Positive', N'positive', 0, null);
INSERT INTO pennrapidtest.dbo.mod_cvd_result_type (result_type_id, result_type, result_value, archive, lab_id) VALUES (3, N'Indeterminate', N'indeterminate', 0, null);
INSERT INTO pennrapidtest.dbo.mod_cvd_result_type (result_type_id, result_type, result_value, archive, lab_id) VALUES (4, N'Test Not Performed', N'not_performed', 0, null);
INSERT INTO pennrapidtest.dbo.mod_cvd_result_type (result_type_id, result_type, result_value, archive, lab_id) VALUES (5, N'Invalid', N'invalid', 0, null);


SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_result_type OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_site_type ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (1, N'School', N'sch', 0, null);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (2, N'Texas Military Department', N'TMD', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (3, N'Texas Division of Emergency Management', N'TDEM', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (4, N'Nursing Home', N'NH', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (5, N'Fire Department', N'FD', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (6, N'Assisted Living Facility', N'ASL', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (7, N'College', N'College', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (8, N'Test', N'Test', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (9, N'Business', N'BUS', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (10, N'Texas Department of Public Safety', N'DPS', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (11, N'Government', N'GVT', 0, 60);
INSERT INTO pennrapidtest.dbo.mod_cvd_site_type (site_type_id, site_type, site_type_abbr, archive, lock_time) VALUES (12, N'State Capitol', N'SC', 0, 5);




SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_site_type OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_test_type ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_test_type (id, reason, archive, sort_order, short, loinc_code, friendly_name, app_visible) VALUES (1, N'Antigen', 0, null, null, N'94558-4', null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_test_type (id, reason, archive, sort_order, short, loinc_code, friendly_name, app_visible) VALUES (3, N'Molecular', 0, null, null, N'94309-2', null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_test_type (id, reason, archive, sort_order, short, loinc_code, friendly_name, app_visible) VALUES (5, N'Antibody', 0, null, null, N'94762-2', null, 0);
INSERT INTO pennrapidtest.dbo.mod_cvd_test_type (id, reason, archive, sort_order, short, loinc_code, friendly_name, app_visible) VALUES (6, N'Unknown', 0, null, null, N'276727009', null, 0);



SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_test_type OFF;
SET IDENTITY_INSERT pennrapidtest.dbo.mod_cvd_upload_type ON;
INSERT INTO pennrapidtest.dbo.mod_cvd_upload_type (id, descr) VALUES (1, N'T-Sheets');
INSERT INTO pennrapidtest.dbo.mod_cvd_upload_type (id, descr) VALUES (3, N'Results');
INSERT INTO pennrapidtest.dbo.mod_cvd_upload_type (id, descr) VALUES (4, N'Error');
INSERT INTO pennrapidtest.dbo.mod_cvd_upload_type (id, descr) VALUES (5, N'Lab Results');


