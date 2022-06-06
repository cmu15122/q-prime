-- Created by pranav

DROP DATABASE IF EXISTS q;
CREATE DATABASE q;
grant all on q.* to 'root'@'localhost'; /* add "IDENTIFIED BY <pwd>" if u have a password */

USE q;

-- tables
-- Table: Assignments
CREATE TABLE Assignments (
    assignment_id int NOT NULL,
    name varchar(256) NOT NULL,
    category varchar(256) NOT NULL,
    CONSTRAINT Assignments_pk PRIMARY KEY (assignment_id)
);

-- Table: Questions
CREATE TABLE Questions (
    question_id int NOT NULL,
    ta_id int NOT NULL,
    student_id int NOT NULL,
    sem_id varchar(3) NOT NULL,
    question text NOT NULL,
    tried_so_far text NOT NULL,
    location varchar(255) NOT NULL,
    assignment varchar(255) NOT NULL,
    entry_time timestamp NOT NULL,
    help_time timestamp NOT NULL,
    exit_time timestamp NOT NULL,
    num_asked_to_fix bigint NOT NULL,
    CONSTRAINT Questions_pk PRIMARY KEY (question_id)
);

-- Table: Semesters
CREATE TABLE Semesters (
    sem_id varchar(3) NOT NULL,
    CONSTRAINT Semesters_pk PRIMARY KEY (sem_id)
);

-- Table: Students
CREATE TABLE Students (
    student_id int NOT NULL,
    num_questions bigint NOT NULL,
    time_on_queue bigint NOT NULL,
    CONSTRAINT Students_pk PRIMARY KEY (student_id)
);

-- Table: TAs
CREATE TABLE TAs (
    ta_id int NOT NULL,
    is_admin int NOT NULL,
    zoom_url varchar(256) NOT NULL,
    num_helped bigint NOT NULL,
    time_helped bigint NOT NULL,
    CONSTRAINT TAs_pk PRIMARY KEY (ta_id)
);

-- Table: Users
CREATE TABLE Users (
    user_id int NOT NULL,
    email varchar(256) NOT NULL,
    fname varchar(256) NOT NULL,
    lname varchar(256) NOT NULL,
    access_token varchar(256) NOT NULL,
    CONSTRAINT Users_pk PRIMARY KEY (user_id)
);

-- Table: assignments_semesters
CREATE TABLE assignments_semesters (
    sem_id varchar(3) NOT NULL,
    assignment_id int NOT NULL,
    start_date timestamp NOT NULL,
    end_date timestamp NOT NULL,
    CONSTRAINT assignments_semesters_pk PRIMARY KEY (sem_id,assignment_id)
);

-- Table: semesters_users
CREATE TABLE semesters_users (
    sem_id varchar(3) NOT NULL,
    user_id int NOT NULL,
    CONSTRAINT semesters_users_pk PRIMARY KEY (sem_id,user_id)
);

-- foreign keys
-- Reference: Questions_Semesters (table: Questions)
ALTER TABLE Questions ADD CONSTRAINT Questions_Semesters FOREIGN KEY Questions_Semesters (sem_id)
    REFERENCES Semesters (sem_id);

-- Reference: Questions_Students (table: Questions)
ALTER TABLE Questions ADD CONSTRAINT Questions_Students FOREIGN KEY Questions_Students (student_id)
    REFERENCES Students (student_id);

-- Reference: Questions_TAs (table: Questions)
ALTER TABLE Questions ADD CONSTRAINT Questions_TAs FOREIGN KEY Questions_TAs (ta_id)
    REFERENCES TAs (ta_id);

-- Reference: Semesters_semesters_tas (table: semesters_users)
ALTER TABLE semesters_users ADD CONSTRAINT Semesters_semesters_tas FOREIGN KEY Semesters_semesters_tas (sem_id)
    REFERENCES Semesters (sem_id);

-- Reference: TAs_semesters_tas (table: semesters_users)
ALTER TABLE semesters_users ADD CONSTRAINT TAs_semesters_tas FOREIGN KEY TAs_semesters_tas (user_id)
    REFERENCES Users (user_id);

-- Reference: Users_Students (table: Students)
ALTER TABLE Students ADD CONSTRAINT Users_Students FOREIGN KEY Users_Students (student_id)
    REFERENCES Users (user_id);

-- Reference: Users_TAs (table: TAs)
ALTER TABLE TAs ADD CONSTRAINT Users_TAs FOREIGN KEY Users_TAs (ta_id)
    REFERENCES Users (user_id);

-- Reference: assignments_semesters_Assignments (table: assignments_semesters)
ALTER TABLE assignments_semesters ADD CONSTRAINT assignments_semesters_Assignments FOREIGN KEY assignments_semesters_Assignments (assignment_id)
    REFERENCES Assignments (assignment_id);

-- Reference: assignments_semesters_Semesters (table: assignments_semesters)
ALTER TABLE assignments_semesters ADD CONSTRAINT assignments_semesters_Semesters FOREIGN KEY assignments_semesters_Semesters (sem_id)
    REFERENCES Semesters (sem_id);

-- End of file.

