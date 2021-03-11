# binax -> binax_template migration

    ALTER TABLE mod_cvd_site_type ADD lock_time INT NOT NULL DEFAULT 60;
    ALTER TABLE mod_cvd_list ADD dl_scan_state VARCHAR(255) DEFAULT NULL;
    ALTER TABLE mod_cvd_site_type ADD lock_time INT DEFAULT 60;
    ALTER TABLE mod_cvd_list ADD patient_test_started DATETIME DEFAULT NULL;
    ALTER TABLE sys_county ADD state CHAR(2) NOT NULL;
    CREATE UNIQUE INDEX proctor_email_address_uindex ON proctor (email_address)
    ALTER TABLE mod_cvd_list ADD kit_manufacturer VARCHAR(255) DEFAULT NULL;
