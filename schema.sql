create database if not exists lead_mgmt
character set utf8mb4;

use lead_mgmt;

create table if not exists leads (
    id char(36) primary key,
    full_name varchar(100) not null,
    email varchar(254) not null,
    email_normalised varchar(254) not null,
    company_name varchar(150) not null,
    phone varchar(16) not null,
    lead_source enum('website', 'linkedin', 'referral', 'event') not null,
    deal_value decimal(12, 2) not null,
    priority enum('high', 'medium', 'low') not null,
    status enum('new', 'contacted', 'qualified', 'lost') not null default 'new',
    created_at datetime(3) not null,
    unique key uq_email(email_normalised),
    key idx_created (created_at, id)
);

