-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2022-06-10 03:14:56.756

-- tables
-- Table: Assignments
CREATE TABLE Assignments (
    assignment_id int  NOT NULL,
    name varchar(256)  NOT NULL,
    category varchar(256)  NOT NULL,
    CONSTRAINT Assignments_pk PRIMARY KEY (assignment_id)
);

-- Table: Questions
CREATE TABLE Questions (
    question_id int  NOT NULL,
    ta_id int  NOT NULL,
    student_id int  NOT NULL,
    sem_id varchar(3)  NOT NULL,
    question text  NOT NULL,
    tried_so_far text  NOT NULL,
    location varchar(255)  NOT NULL,
    assignment varchar(255)  NOT NULL,
    entry_time timestamp  NOT NULL,
    help_time timestamp  NOT NULL,
    exit_time timestamp  NOT NULL,
    num_asked_to_fix bigint  NOT NULL,
    CONSTRAINT Questions_pk PRIMARY KEY (question_id)
);

-- Table: Semesters
CREATE TABLE Semesters (
    sem_id varchar(3)  NOT NULL,
    CONSTRAINT Semesters_pk PRIMARY KEY (sem_id)
);

-- Table: Students
CREATE TABLE Students (
    student_id int  NOT NULL,
    num_questions bigint  NOT NULL,
    time_on_queue bigint  NOT NULL,
    CONSTRAINT Students_pk PRIMARY KEY (student_id)
);

-- Table: TAs
CREATE TABLE TAs (
    ta_id int  NOT NULL,
    is_admin int  NOT NULL,
    zoom_url varchar(256)  NOT NULL,
    num_helped bigint  NOT NULL,
    time_helped bigint  NOT NULL,
    CONSTRAINT TAs_pk PRIMARY KEY (ta_id)
);

-- Table: Users
CREATE TABLE Users (
    user_id int  NOT NULL,
    email varchar(256)  NOT NULL,
    fname varchar(256)  NOT NULL,
    lname varchar(256)  NOT NULL,
    access_token varchar(256)  NOT NULL,
    settings json  NOT NULL,
    CONSTRAINT Users_pk PRIMARY KEY (user_id)
);

-- Table: assignments_semesters
CREATE TABLE assignments_semesters (
    sem_id varchar(3)  NOT NULL,
    assignment_id int  NOT NULL,
    start_date timestamp  NOT NULL,
    end_date timestamp  NOT NULL,
    CONSTRAINT assignments_semesters_pk PRIMARY KEY (sem_id,assignment_id)
);

-- Table: semesters_users
CREATE TABLE semesters_users (
    sem_id varchar(3)  NOT NULL,
    user_id int  NOT NULL,
    is_ta int  NOT NULL,
    CONSTRAINT semesters_users_pk PRIMARY KEY (sem_id,user_id)
);

-- foreign keys
-- Reference: Questions_Semesters (table: Questions)
ALTER TABLE Questions ADD CONSTRAINT Questions_Semesters
    FOREIGN KEY (sem_id)
    REFERENCES Semesters (sem_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Questions_Students (table: Questions)
ALTER TABLE Questions ADD CONSTRAINT Questions_Students
    FOREIGN KEY (student_id)
    REFERENCES Students (student_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Questions_TAs (table: Questions)
ALTER TABLE Questions ADD CONSTRAINT Questions_TAs
    FOREIGN KEY (ta_id)
    REFERENCES TAs (ta_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Semesters_semesters_tas (table: semesters_users)
ALTER TABLE semesters_users ADD CONSTRAINT Semesters_semesters_tas
    FOREIGN KEY (sem_id)
    REFERENCES Semesters (sem_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: TAs_semesters_tas (table: semesters_users)
ALTER TABLE semesters_users ADD CONSTRAINT TAs_semesters_tas
    FOREIGN KEY (user_id)
    REFERENCES Users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Users_Students (table: Students)
ALTER TABLE Students ADD CONSTRAINT Users_Students
    FOREIGN KEY (student_id)
    REFERENCES Users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Users_TAs (table: TAs)
ALTER TABLE TAs ADD CONSTRAINT Users_TAs
    FOREIGN KEY (ta_id)
    REFERENCES Users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: assignments_semesters_Assignments (table: assignments_semesters)
ALTER TABLE assignments_semesters ADD CONSTRAINT assignments_semesters_Assignments
    FOREIGN KEY (assignment_id)
    REFERENCES Assignments (assignment_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: assignments_semesters_Semesters (table: assignments_semesters)
ALTER TABLE assignments_semesters ADD CONSTRAINT assignments_semesters_Semesters
    FOREIGN KEY (sem_id)
    REFERENCES Semesters (sem_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.

