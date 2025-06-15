--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_stats (
    id integer NOT NULL,
    total_users integer DEFAULT 0,
    total_jobs integer DEFAULT 0,
    total_proposals integer DEFAULT 0,
    total_contracts integer DEFAULT 0,
    total_revenue numeric(12,2) DEFAULT '0'::numeric,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: admin_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_stats_id_seq OWNED BY public.admin_stats.id;


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id integer NOT NULL,
    job_id integer NOT NULL,
    freelancer_id character varying NOT NULL,
    client_id character varying NOT NULL,
    proposal_id integer NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    total_earnings numeric(10,2) DEFAULT '0'::numeric,
    hours_worked numeric(10,2) DEFAULT '0'::numeric,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contracts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contracts_id_seq OWNED BY public.contracts.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    client_id character varying NOT NULL,
    category character varying NOT NULL,
    budget_type character varying NOT NULL,
    budget_min numeric(10,2),
    budget_max numeric(10,2),
    hourly_rate numeric(10,2),
    experience_level character varying NOT NULL,
    skills text[],
    status character varying DEFAULT 'open'::character varying NOT NULL,
    remote boolean DEFAULT true,
    proposal_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id character varying NOT NULL,
    receiver_id character varying NOT NULL,
    content text NOT NULL,
    job_id integer,
    proposal_id integer,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposals (
    id integer NOT NULL,
    job_id integer NOT NULL,
    freelancer_id character varying NOT NULL,
    cover_letter text NOT NULL,
    proposed_rate numeric(10,2),
    timeline character varying,
    status character varying DEFAULT 'submitted'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proposals_id_seq OWNED BY public.proposals.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: user_suspensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_suspensions (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    admin_id character varying NOT NULL,
    reason text NOT NULL,
    suspended_until timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: user_suspensions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_suspensions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_suspensions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_suspensions_id_seq OWNED BY public.user_suspensions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    user_type character varying DEFAULT 'client'::character varying NOT NULL,
    title character varying,
    bio text,
    hourly_rate numeric(10,2),
    skills text[],
    location character varying,
    company character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: admin_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_stats ALTER COLUMN id SET DEFAULT nextval('public.admin_stats_id_seq'::regclass);


--
-- Name: contracts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts ALTER COLUMN id SET DEFAULT nextval('public.contracts_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: proposals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals ALTER COLUMN id SET DEFAULT nextval('public.proposals_id_seq'::regclass);


--
-- Name: user_suspensions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suspensions ALTER COLUMN id SET DEFAULT nextval('public.user_suspensions_id_seq'::regclass);


--
-- Data for Name: admin_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_stats (id, total_users, total_jobs, total_proposals, total_contracts, total_revenue, updated_at) FROM stdin;
1	6	3	4	2	1500.00	2025-06-14 15:37:44.629889
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, job_id, freelancer_id, client_id, proposal_id, status, total_earnings, hours_worked, created_at, updated_at) FROM stdin;
3	1	40715683	40715683	5	completed	0.00	0.00	2025-06-14 17:14:22.920261	2025-06-14 17:32:04.129
1	1	freelancer1	40715683	1	completed	1500.00	25.50	2025-06-07 15:37:36.428032	2025-06-14 17:33:16.172
2	2	freelancer2	40715683	2	active	0.00	0.00	2025-06-12 15:37:36.428032	2025-06-14 17:33:37.661
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, title, description, client_id, category, budget_type, budget_min, budget_max, hourly_rate, experience_level, skills, status, remote, proposal_count, created_at, updated_at) FROM stdin;
2	Mobile App UI/UX Design	Design beautiful and intuitive mobile app interfaces for iOS and Android. Need complete wireframes and high-fidelity mockups.	40715683	Design	hourly	\N	\N	50.00	expert	{Figma,"Mobile Design",UI/UX,Prototyping}	open	t	0	2025-06-14 15:36:36.964492	2025-06-14 15:36:36.964492
3	Python Data Analysis Project	Analyze customer data and create visualizations. Experience with pandas, matplotlib, and statistical analysis required.	40715683	Data Science	fixed	1500.00	3000.00	\N	intermediate	{Python,Pandas,"Data Analysis",Matplotlib}	open	t	0	2025-06-14 15:36:36.964492	2025-06-14 15:36:36.964492
1	Frontend React Developer	Build a modern web application using React and TypeScript. Need someone experienced with hooks, state management, and API integration.	40715683	Web Development	fixed	2000.00	5000.00	\N	intermediate	{React,TypeScript,JavaScript,CSS}	in_progress	t	1	2025-06-14 15:36:36.964492	2025-06-14 17:14:23.007
4	CREATE REACT DASHBOARD	400: {"message":"Invalid job data","errors":[{"code":"invalid_type","expected":"string","received":"number","path":["budgetMin"],"message":"Expected string, received number"},{"code":"invalid_type","expected":"string","received":"number","path":["budgetMax"],"message":"Expected string, received number400: {"message":"Invalid job data","errors":[{"code":"invalid_type","expected":"string","received":"number","path":["budgetMin"],"message":"Expected string, received number"},{"code":"invalid_type","expected":"string","received":"number","path":["budgetMax"],"message":"Expected string, received number	40715683	UI/UX Design	fixed	1500.00	3000.00	\N	expert	{JavaScript,Node.js,Flask}	open	t	0	2025-06-14 17:57:18.182353	2025-06-14 17:57:18.182353
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, sender_id, receiver_id, content, job_id, proposal_id, read, created_at) FROM stdin;
1	40715683	freelancer1	Hi Sarah! I reviewed your proposal for the React project. Your experience looks great. Can you tell me more about your approach to state management?	1	1	f	2025-06-14 13:37:04.6422
2	freelancer1	40715683	Thank you for reaching out! I typically use Redux Toolkit for complex state management, but for smaller projects, I prefer React Context with useReducer. For this project, I would recommend Redux Toolkit given the scope.	1	1	t	2025-06-14 13:52:04.6422
3	40715683	freelancer1	That sounds perfect. What about testing? Do you include unit tests in your deliverables?	1	1	f	2025-06-14 14:07:04.6422
4	freelancer1	40715683	Absolutely! I always include comprehensive unit tests using Jest and React Testing Library. I also set up integration tests for critical user flows.	1	1	t	2025-06-14 14:22:04.6422
5	40715683	freelancer2	Hi Mike! Your portfolio looks impressive. For the mobile app design, do you provide developer handoff documentation?	2	2	f	2025-06-14 12:37:04.6422
6	freelancer2	40715683	Hi! Yes, I provide detailed design specs, asset exports, and developer handoff documentation. I also offer 2 weeks of support during implementation.	2	2	t	2025-06-14 12:52:04.6422
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proposals (id, job_id, freelancer_id, cover_letter, proposed_rate, timeline, status, created_at, updated_at) FROM stdin;
1	1	freelancer1	I have 5+ years of React experience and have built numerous web applications with TypeScript. I can deliver a high-quality, scalable solution within your budget and timeline.	3500.00	\N	pending	2025-06-14 15:36:52.961764	2025-06-14 15:36:52.961764
2	2	freelancer2	As a UI/UX designer with 8 years of experience, I specialize in mobile app design. I will provide complete wireframes, prototypes, and high-fidelity designs that follow best practices.	50.00	\N	pending	2025-06-14 15:36:52.961764	2025-06-14 15:36:52.961764
3	3	freelancer3	Data scientist with expertise in Python and statistical analysis. I can provide comprehensive data insights with clear visualizations and actionable recommendations.	2200.00	\N	pending	2025-06-14 15:36:52.961764	2025-06-14 15:36:52.961764
4	1	freelancer3	I have experience with both frontend and backend development. While my specialty is data science, I have solid React skills and can deliver quality work.	2800.00	\N	pending	2025-06-14 15:36:52.961764	2025-06-14 15:36:52.961764
5	1	40715683	hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh	1500.00	2 weeks	accepted	2025-06-14 17:11:22.495079	2025-06-14 17:14:23.153
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
Zfx8XI8baB6H-v1DlgCOxVcdJRNDvKsk	{"cookie": {"path": "/", "secure": true, "expires": "2025-06-21T15:16:59.045Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "wm02GP92V7sdX3wn1X2cxB-acGKajOBG-wVTojTB9rE"}}	2025-06-21 15:17:00
wnTjpW86MsvIDi4rkO2QUU41x4_tEfnl	{"cookie": {"path": "/", "secure": true, "expires": "2025-06-22T13:17:47.664Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "789cafd9-60b1-45fc-a05b-b50f1641a728", "exp": 1749997066, "iat": 1749993466, "iss": "https://replit.com/oidc", "sub": "40715683", "email": "boody.nagy@gmail.com", "at_hash": "B-Ii183Ka8f7OQnMa3Ro9w", "username": "boodynagy", "auth_time": 1749938447, "last_name": "Nagy", "first_name": "Abdelrhman"}, "expires_at": 1749997066, "access_token": "CksVyP445GDRiiJTwD5Xxtv-wVHhI87GM9sNXPXDTe6", "refresh_token": "WGOA1q2vPMROy9_BMdBV2wfLAiBVkWasOw_mopkH38v"}}}	2025-06-22 13:38:00
\.


--
-- Data for Name: user_suspensions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_suspensions (id, user_id, admin_id, reason, suspended_until, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, user_type, title, bio, hourly_rate, skills, location, company, created_at, updated_at) FROM stdin;
admin123	admin@example.com	Admin	User	\N	admin	\N	\N	\N	\N	\N	\N	2025-06-14 15:28:21.133283	2025-06-14 15:28:21.133283
freelancer1	sarah.dev@example.com	Sarah	Johnson	\N	freelancer	\N	\N	\N	\N	\N	\N	2025-06-14 15:36:43.876515	2025-06-14 15:36:43.876515
freelancer2	mike.designer@example.com	Mike	Chen	\N	freelancer	\N	\N	\N	\N	\N	\N	2025-06-14 15:36:43.876515	2025-06-14 15:36:43.876515
freelancer3	alex.data@example.com	Alex	Rodriguez	\N	freelancer	\N	\N	\N	\N	\N	\N	2025-06-14 15:36:43.876515	2025-06-14 15:36:43.876515
client1	startup.ceo@example.com	Emma	Wilson	\N	client	\N	\N	\N	\N	\N	\N	2025-06-14 15:36:43.876515	2025-06-14 15:36:43.876515
40715683	boody.nagy@gmail.com	Abdelrhman	Nagy	data:image/png;base64,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	client		Computer	\N	{React}	Egypt	FSCommunity	2025-06-14 15:29:33.819574	2025-06-14 22:00:47.707
\.


--
-- Name: admin_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_stats_id_seq', 1, false);


--
-- Name: contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contracts_id_seq', 3, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jobs_id_seq', 4, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 6, true);


--
-- Name: proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proposals_id_seq', 5, true);


--
-- Name: user_suspensions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_suspensions_id_seq', 1, false);


--
-- Name: admin_stats admin_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_stats
    ADD CONSTRAINT admin_stats_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: user_suspensions user_suspensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suspensions
    ADD CONSTRAINT user_suspensions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: contracts contracts_client_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_client_id_users_id_fk FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: contracts contracts_freelancer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_freelancer_id_users_id_fk FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: contracts contracts_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: contracts contracts_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);


--
-- Name: jobs jobs_client_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_client_id_users_id_fk FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: messages messages_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: messages messages_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);


--
-- Name: messages messages_receiver_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_users_id_fk FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: proposals proposals_freelancer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_freelancer_id_users_id_fk FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: proposals proposals_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: user_suspensions user_suspensions_admin_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suspensions
    ADD CONSTRAINT user_suspensions_admin_id_users_id_fk FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: user_suspensions user_suspensions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suspensions
    ADD CONSTRAINT user_suspensions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

