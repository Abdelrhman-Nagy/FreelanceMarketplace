-- FreelanceHub Complete Database Schema Export
-- Generated after latest comprehensive audit and fixes
-- Date: 2025-06-23

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: admin_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_actions (
    id SERIAL PRIMARY KEY,
    admin_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: admin_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_stats (
    id SERIAL PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    total_proposals INTEGER DEFAULT 0,
    total_contracts INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    freelancer_id CHARACTER VARYING NOT NULL,
    client_id CHARACTER VARYING NOT NULL,
    proposal_id INTEGER NOT NULL,
    status CHARACTER VARYING DEFAULT 'active'::CHARACTER VARYING NOT NULL,
    total_earnings NUMERIC DEFAULT 0,
    hours_worked NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    proposed_rate INTEGER,
    estimated_duration TEXT,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    terms TEXT
);

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    client_id TEXT NOT NULL,
    category TEXT NOT NULL,
    budget_type TEXT NOT NULL,
    budget_min INTEGER,
    budget_max INTEGER,
    hourly_rate INTEGER,
    experience_level TEXT NOT NULL,
    skills JSONB DEFAULT '[]'::JSONB,
    status TEXT DEFAULT 'active'::TEXT,
    remote BOOLEAN DEFAULT FALSE,
    duration TEXT,
    proposal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITHOUT TIME ZONE,
    urgency_level TEXT DEFAULT 'normal'::TEXT,
    CONSTRAINT jobs_budget_type_check CHECK ((budget_type = ANY (ARRAY['fixed'::TEXT, 'hourly'::TEXT]))),
    CONSTRAINT jobs_experience_level_check CHECK ((experience_level = ANY (ARRAY['Entry'::TEXT, 'Intermediate'::TEXT, 'Expert'::TEXT]))),
    CONSTRAINT jobs_status_check CHECK ((status = ANY (ARRAY['active'::TEXT, 'closed'::TEXT, 'draft'::TEXT]))),
    CONSTRAINT jobs_urgency_level_check CHECK ((urgency_level = ANY (ARRAY['normal'::TEXT, 'urgent'::TEXT, 'critical'::TEXT])))
);

--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id SERIAL PRIMARY KEY,
    sender_id CHARACTER VARYING NOT NULL,
    receiver_id CHARACTER VARYING NOT NULL,
    content TEXT NOT NULL,
    job_id INTEGER,
    proposal_id INTEGER,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id CHARACTER VARYING(255) NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    token CHARACTER VARYING(255) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: project_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    uploaded_by TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: project_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member'::TEXT,
    joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: project_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    sender_id TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text'::TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_id TEXT NOT NULL,
    freelancer_id TEXT,
    job_id INTEGER,
    status TEXT DEFAULT 'active'::TEXT,
    deadline DATE,
    budget NUMERIC,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    client_name TEXT,
    freelancer_name TEXT,
    CONSTRAINT projects_status_check CHECK ((status = ANY (ARRAY['active'::TEXT, 'completed'::TEXT, 'paused'::TEXT, 'cancelled'::TEXT])))
);

--
-- Name: proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposals (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    freelancer_id TEXT NOT NULL,
    cover_letter TEXT NOT NULL,
    proposed_rate INTEGER,
    estimated_duration TEXT,
    status TEXT DEFAULT 'pending'::TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    freelancer_name TEXT,
    freelancer_email TEXT,
    freelancer_title TEXT,
    freelancer_skills JSONB DEFAULT '[]'::JSONB,
    CONSTRAINT proposals_status_check CHECK ((status = ANY (ARRAY['pending'::TEXT, 'accepted'::TEXT, 'rejected'::TEXT, 'withdrawn'::TEXT])))
);

--
-- Name: saved_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_id INTEGER NOT NULL,
    saved_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT saved_jobs_user_job_unique UNIQUE (user_id, job_id)
);

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid CHARACTER VARYING NOT NULL PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT,
    status TEXT DEFAULT 'todo'::TEXT,
    priority TEXT DEFAULT 'medium'::TEXT,
    due_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::TEXT, 'medium'::TEXT, 'high'::TEXT]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['todo'::TEXT, 'in_progress'::TEXT, 'completed'::TEXT, 'cancelled'::TEXT])))
);

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: user_suspensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_suspensions (
    id SERIAL PRIMARY KEY,
    user_id CHARACTER VARYING NOT NULL,
    admin_id CHARACTER VARYING NOT NULL,
    reason TEXT NOT NULL,
    suspended_until TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_type TEXT NOT NULL,
    company TEXT,
    rating INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    profile_image TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    password_hash CHARACTER VARYING(255),
    title TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]'::JSONB,
    hourly_rate INTEGER,
    location TEXT,
    timezone TEXT,
    phone_number TEXT,
    website TEXT,
    portfolio TEXT,
    experience TEXT,
    completed_jobs INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITHOUT TIME ZONE,
    status TEXT DEFAULT 'active'::TEXT,
    role TEXT,
    CONSTRAINT users_experience_check CHECK ((experience = ANY (ARRAY['entry'::TEXT, 'intermediate'::TEXT, 'expert'::TEXT]))),
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::TEXT, 'pending'::TEXT, 'suspended'::TEXT]))),
    CONSTRAINT users_user_type_check CHECK ((user_type = ANY (ARRAY['client'::TEXT, 'freelancer'::TEXT, 'admin'::TEXT])))
);

--
-- Name: Foreign Key Constraints
--

ALTER TABLE ONLY public.admin_actions
    ADD CONSTRAINT admin_actions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.user_suspensions
    ADD CONSTRAINT user_suspensions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.user_suspensions
    ADD CONSTRAINT user_suspensions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

--
-- Name: Indexes for better performance
--

CREATE INDEX idx_contracts_client_id ON public.contracts USING btree (client_id);
CREATE INDEX idx_contracts_freelancer_id ON public.contracts USING btree (freelancer_id);
CREATE INDEX idx_contracts_job_id ON public.contracts USING btree (job_id);
CREATE INDEX idx_contracts_status ON public.contracts USING btree (status);

CREATE INDEX idx_jobs_category ON public.jobs USING btree (category);
CREATE INDEX idx_jobs_client_id ON public.jobs USING btree (client_id);
CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);
CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (created_at);

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages USING btree (receiver_id);
CREATE INDEX idx_messages_job_id ON public.messages USING btree (job_id);

CREATE INDEX idx_project_messages_project_id ON public.project_messages USING btree (project_id);
CREATE INDEX idx_project_messages_sender_id ON public.project_messages USING btree (sender_id);

CREATE INDEX idx_projects_client_id ON public.projects USING btree (client_id);
CREATE INDEX idx_projects_freelancer_id ON public.projects USING btree (freelancer_id);
CREATE INDEX idx_projects_status ON public.projects USING btree (status);

CREATE INDEX idx_proposals_freelancer_id ON public.proposals USING btree (freelancer_id);
CREATE INDEX idx_proposals_job_id ON public.proposals USING btree (job_id);
CREATE INDEX idx_proposals_status ON public.proposals USING btree (status);

CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs USING btree (user_id);
CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs USING btree (job_id);

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (sid);
CREATE INDEX idx_sessions_expire ON public.sessions USING btree (expire);

CREATE INDEX idx_tasks_project_id ON public.tasks USING btree (project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions USING btree (token);

CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_user_type ON public.users USING btree (user_type);
CREATE INDEX idx_users_status ON public.users USING btree (status);

--
-- Summary: FreelanceHub Database Schema
-- 
-- Total Tables: 16
-- - admin_actions: Admin activity tracking
-- - admin_stats: Platform statistics
-- - contracts: Freelancer-client agreements
-- - jobs: Job postings by clients
-- - messages: Direct messaging system
-- - password_reset_tokens: Password recovery
-- - project_files: File uploads for projects
-- - project_members: Project team members
-- - project_messages: Project communication
-- - projects: Active projects
-- - proposals: Job applications by freelancers
-- - saved_jobs: User bookmarked jobs
-- - sessions: User session management
-- - tasks: Project task management
-- - user_sessions: Extended session tracking
-- - user_suspensions: Admin user management
-- - users: Platform users (clients, freelancers, admins)
--
-- Key Features:
-- - Complete user management with roles and permissions
-- - Full job posting and proposal workflow
-- - Project management with tasks and messaging
-- - Admin dashboard functionality
-- - Comprehensive audit trails
-- - Performance optimized with indexes
-- - Data integrity with foreign key constraints
--