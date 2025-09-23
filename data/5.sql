--
-- PostgreSQL database dump
--

\restrict pZESvrtPH5Gmoqb1VgrmsQzhw8yDi6tL8b2d3vqnbXmUMOGiYGjkfXNMgh2twyj

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _enumValues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_enumValues" (
    id integer NOT NULL,
    status smallint NOT NULL,
    name character varying(64) NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    value integer NOT NULL,
    "valuesLinker" integer NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public."_enumValues" OWNER TO postgres;

--
-- Name: _enums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._enums (
    id integer NOT NULL,
    status smallint NOT NULL,
    name character varying(64) NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL
);


ALTER TABLE public._enums OWNER TO postgres;

--
-- Name: _enumsidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._enumsidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._enumsidseq OWNER TO postgres;

--
-- Name: _enumsidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._enumsidseq OWNED BY public._enums.id;


--
-- Name: _enumvaluesidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._enumvaluesidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._enumvaluesidseq OWNER TO postgres;

--
-- Name: _enumvaluesidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._enumvaluesidseq OWNED BY public."_enumValues".id;


--
-- Name: _fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._fields (
    id integer NOT NULL,
    name character varying(128) NOT NULL,
    status smallint NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    "nodeFieldsLinker" integer NOT NULL,
    show integer DEFAULT 0 NOT NULL,
    prior integer NOT NULL,
    "fieldType" integer NOT NULL,
    "fieldName" character varying(33) NOT NULL,
    "selectFieldName" character varying(255) DEFAULT ''::character varying NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    "maxLength" integer DEFAULT 0 NOT NULL,
    requirement smallint DEFAULT 0 NOT NULL,
    "unique" smallint DEFAULT 0 NOT NULL,
    "forSearch" smallint DEFAULT 0 NOT NULL,
    "storeInDb" smallint DEFAULT 0 NOT NULL,
    "nodeRef" integer DEFAULT 0 NOT NULL,
    multilingual smallint DEFAULT 0 NOT NULL,
    "sendToServer" smallint DEFAULT 1 NOT NULL,
    icon character varying(24) DEFAULT ''::character varying NOT NULL,
    height integer DEFAULT 0 NOT NULL,
    enum integer DEFAULT 0 NOT NULL,
    "lookupIcon" character varying(33) DEFAULT ''::character varying NOT NULL,
    display integer DEFAULT 0 NOT NULL,
    "cssClass" character varying(128) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public._fields OWNER TO postgres;

--
-- Name: _fieldsidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._fieldsidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._fieldsidseq OWNER TO postgres;

--
-- Name: _fieldsidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._fieldsidseq OWNED BY public._fields.id;


--
-- Name: _files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._files (
    id integer NOT NULL,
    status smallint NOT NULL,
    name character varying(64) NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    file character varying(127) NOT NULL
);


ALTER TABLE public._files OWNER TO postgres;

--
-- Name: _filesidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._filesidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._filesidseq OWNER TO postgres;

--
-- Name: _filesidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._filesidseq OWNED BY public._files.id;


--
-- Name: _filterAccessRoles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_filterAccessRoles" (
    "_filtersId" integer NOT NULL,
    "_rolesId" integer NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public."_filterAccessRoles" OWNER TO postgres;

--
-- Name: _filteraccessrolesidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._filteraccessrolesidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._filteraccessrolesidseq OWNER TO postgres;

--
-- Name: _filteraccessrolesidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._filteraccessrolesidseq OWNED BY public."_filterAccessRoles".id;


--
-- Name: _filters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._filters (
    id integer NOT NULL,
    status smallint NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    "nodeFiltersLinker" integer NOT NULL,
    name character varying(40) NOT NULL,
    filter text NOT NULL,
    view character varying(127) NOT NULL,
    "hiPriority" smallint NOT NULL,
    fields character varying(255) NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public._filters OWNER TO postgres;

--
-- Name: _filtersidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._filtersidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._filtersidseq OWNER TO postgres;

--
-- Name: _filtersidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._filtersidseq OWNED BY public._filters.id;


--
-- Name: _html; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._html (
    id integer NOT NULL,
    status smallint NOT NULL,
    name character varying(64) NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    body text NOT NULL,
    title character varying(127) NOT NULL
);


ALTER TABLE public._html OWNER TO postgres;

--
-- Name: _htmlidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._htmlidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._htmlidseq OWNER TO postgres;

--
-- Name: _htmlidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._htmlidseq OWNED BY public._html.id;


--
-- Name: _languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._languages (
    id integer NOT NULL,
    status smallint NOT NULL,
    name character varying(64) NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    code character varying(2) NOT NULL,
    "langIcon" character varying(30) NOT NULL,
    "isUILanguage" smallint NOT NULL
);


ALTER TABLE public._languages OWNER TO postgres;

--
-- Name: _languagesidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._languagesidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._languagesidseq OWNER TO postgres;

--
-- Name: _languagesidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._languagesidseq OWNED BY public._languages.id;


--
-- Name: _nodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._nodes (
    id integer NOT NULL,
    "nodeType" integer NOT NULL,
    "_nodesId" integer NOT NULL,
    status smallint NOT NULL,
    "tableName" character varying(24) DEFAULT ''::character varying NOT NULL,
    "singleName" character varying(127) DEFAULT ''::character varying NOT NULL,
    name character varying(127) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    prior integer NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    captcha smallint DEFAULT 0 NOT NULL,
    "_organizationId" integer NOT NULL,
    draftable smallint DEFAULT 0 NOT NULL,
    "_fieldsId" integer DEFAULT 0 NOT NULL,
    "staticLink" character varying(128) DEFAULT ''::character varying NOT NULL,
    "recPerPage" integer NOT NULL,
    icon character varying(24) DEFAULT ''::character varying NOT NULL,
    "creationName" character varying(64) DEFAULT ''::character varying NOT NULL,
    reverse smallint DEFAULT 0 NOT NULL,
    "defaultFilterId" integer DEFAULT 0 NOT NULL,
    "storeForms" smallint NOT NULL,
    "cssClass" character varying(128) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public._nodes OWNER TO postgres;

--
-- Name: COLUMN _nodes.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public._nodes.status IS '1-public; 2-template; 0-deleted';


--
-- Name: _nodesidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._nodesidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._nodesidseq OWNER TO postgres;

--
-- Name: _nodesidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._nodesidseq OWNED BY public._nodes.id;


--
-- Name: _organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._organization (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    status smallint NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL
);


ALTER TABLE public._organization OWNER TO postgres;

--
-- Name: _organizationUsers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_organizationUsers" (
    "_organizationId" integer NOT NULL,
    "_usersId" integer NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public."_organizationUsers" OWNER TO postgres;

--
-- Name: _organizationidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._organizationidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._organizationidseq OWNER TO postgres;

--
-- Name: _organizationidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._organizationidseq OWNED BY public._organization.id;


--
-- Name: _organizationusersidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._organizationusersidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._organizationusersidseq OWNER TO postgres;

--
-- Name: _organizationusersidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._organizationusersidseq OWNED BY public."_organizationUsers".id;


--
-- Name: _registration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._registration (
    id integer NOT NULL,
    status smallint NOT NULL,
    name character varying(64) NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    password text NOT NULL,
    email character varying(64) NOT NULL,
    salt character varying(32) NOT NULL,
    "activationKey" character varying(48) NOT NULL
);


ALTER TABLE public._registration OWNER TO postgres;

--
-- Name: _registrationidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._registrationidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._registrationidseq OWNER TO postgres;

--
-- Name: _registrationidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._registrationidseq OWNED BY public._registration.id;


--
-- Name: _rolePrivileges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_rolePrivileges" (
    "nodeId" integer NOT NULL,
    "roleId" integer NOT NULL,
    privileges integer NOT NULL
);


ALTER TABLE public."_rolePrivileges" OWNER TO postgres;

--
-- Name: _roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._roles (
    id integer NOT NULL,
    name character varying(45) NOT NULL,
    status smallint NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_usersId" integer NOT NULL,
    description text NOT NULL,
    "_organizationId" integer NOT NULL,
    "defaultPage" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._roles OWNER TO postgres;

--
-- Name: _rolesidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._rolesidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._rolesidseq OWNER TO postgres;

--
-- Name: _rolesidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._rolesidseq OWNED BY public._roles.id;


--
-- Name: _userRoles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_userRoles" (
    "_usersId" integer NOT NULL,
    "_rolesId" integer NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public."_userRoles" OWNER TO postgres;

--
-- Name: _userrolesidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._userrolesidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._userrolesidseq OWNER TO postgres;

--
-- Name: _userrolesidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._userrolesidseq OWNED BY public."_userRoles".id;


--
-- Name: _users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._users (
    id integer NOT NULL,
    name character varying(64) NOT NULL,
    "_organizationId" integer NOT NULL,
    password character varying(128) NOT NULL,
    salt character varying(32) NOT NULL,
    status smallint NOT NULL,
    "blockedTo" timestamp(6) without time zone NOT NULL,
    mistakes integer NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    email character varying(64) NOT NULL,
    mailing smallint NOT NULL,
    avatar character varying(130) NOT NULL,
    "resetCode" character varying(32) NOT NULL,
    "resetTime" timestamp(6) without time zone NOT NULL,
    "firstName" character varying(20) NOT NULL,
    "lastName" character varying(32) NOT NULL,
    "midName" character varying(24) NOT NULL,
    company character varying(127) NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    "multilingualEnabled" smallint NOT NULL,
    "defaultOrg" integer NOT NULL,
    language integer NOT NULL
);


ALTER TABLE public._users OWNER TO postgres;

--
-- Name: _usersidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._usersidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._usersidseq OWNER TO postgres;

--
-- Name: _usersidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._usersidseq OWNED BY public._users.id;


--
-- Name: myRecords; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."myRecords" (
    id integer NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    name character varying(64) DEFAULT ''::character varying NOT NULL,
    "_usersId" integer NOT NULL,
    "_createdOn" timestamp(6) without time zone DEFAULT now() NOT NULL,
    "_organizationId" integer NOT NULL,
    dttm timestamp without time zone DEFAULT '0385-07-25 08:56:56'::timestamp without time zone NOT NULL
);


ALTER TABLE public."myRecords" OWNER TO postgres;

--
-- Name: myrecordsidseq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.myrecordsidseq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER SEQUENCE public.myrecordsidseq OWNER TO postgres;

--
-- Name: myrecordsidseq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.myrecordsidseq OWNED BY public."myRecords".id;


--
-- Name: _enumValues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_enumValues" ALTER COLUMN id SET DEFAULT nextval('public._enumvaluesidseq'::regclass);


--
-- Name: _enums id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._enums ALTER COLUMN id SET DEFAULT nextval('public._enumsidseq'::regclass);


--
-- Name: _fields id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._fields ALTER COLUMN id SET DEFAULT nextval('public._fieldsidseq'::regclass);


--
-- Name: _files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._files ALTER COLUMN id SET DEFAULT nextval('public._filesidseq'::regclass);


--
-- Name: _filterAccessRoles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_filterAccessRoles" ALTER COLUMN id SET DEFAULT nextval('public._filteraccessrolesidseq'::regclass);


--
-- Name: _filters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._filters ALTER COLUMN id SET DEFAULT nextval('public._filtersidseq'::regclass);


--
-- Name: _html id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._html ALTER COLUMN id SET DEFAULT nextval('public._htmlidseq'::regclass);


--
-- Name: _languages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._languages ALTER COLUMN id SET DEFAULT nextval('public._languagesidseq'::regclass);


--
-- Name: _nodes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._nodes ALTER COLUMN id SET DEFAULT nextval('public._nodesidseq'::regclass);


--
-- Name: _organization id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._organization ALTER COLUMN id SET DEFAULT nextval('public._organizationidseq'::regclass);


--
-- Name: _organizationUsers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_organizationUsers" ALTER COLUMN id SET DEFAULT nextval('public._organizationusersidseq'::regclass);


--
-- Name: _registration id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._registration ALTER COLUMN id SET DEFAULT nextval('public._registrationidseq'::regclass);


--
-- Name: _roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._roles ALTER COLUMN id SET DEFAULT nextval('public._rolesidseq'::regclass);


--
-- Name: _userRoles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_userRoles" ALTER COLUMN id SET DEFAULT nextval('public._userrolesidseq'::regclass);


--
-- Name: _users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._users ALTER COLUMN id SET DEFAULT nextval('public._usersidseq'::regclass);


--
-- Name: myRecords id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."myRecords" ALTER COLUMN id SET DEFAULT nextval('public.myrecordsidseq'::regclass);


--
-- Data for Name: _enumValues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_enumValues" (id, status, name, "_usersId", "_createdOn", "_organizationId", value, "valuesLinker", "order") FROM stdin;
16	1	Tab	1	2016-03-28 08:07:02	0	17	1	12
14	1	Button	1	2016-03-28 08:07:02	0	18	1	13
17	1	HTML editor	1	2016-03-28 08:07:02	0	19	1	14
5	1	Enum	1	2016-03-28 08:05:09	0	6	1	4
44	1	Section	1	2021-09-27 16:24:25	1	1	2	0
45	1	Document	1	2021-09-27 16:24:25	1	2	2	1
46	1	Static Link	1	2021-09-27 17:14:37	1	3	2	2
47	1	React class	1	2021-09-27 17:30:09	1	4	2	3
48	1	Block	1	2021-09-28 18:05:25	1	0	3	0
49	1	Inline	1	2021-09-28 18:05:25	1	1	3	1
30	1	Color	1	2016-10-13 10:56:29	0	20	1	15
50	1	Splitter	1	2021-09-29 13:04:14	1	22	1	17
43	1	File	1	2016-10-13 10:56:29	0	21	1	16
4	1	Bool	1	2016-03-28 08:05:09	0	5	1	3
2	1	Number	1	2016-03-28 08:05:09	0	2	1	1
3	1	DateTime	1	2016-03-28 08:05:09	0	4	1	2
13	1	Lookup N to M	1	2016-03-28 08:05:10	0	14	1	10
6	1	Lookup	1	2016-03-28 08:05:09	0	7	1	5
7	1	Static HTML block	1	2016-03-28 08:05:09	0	8	1	6
18	1	Lookup 1 to N	1	2016-03-28 08:07:02	0	15	1	11
9	1	Password	1	2016-03-28 08:05:09	0	10	1	7
11	1	Image	1	2016-03-28 08:05:09	0	12	1	9
10	1	Date	1	2016-03-28 08:05:09	0	11	1	8
1	1	Text	1	2016-03-28 08:05:09	0	1	1	0
\.


--
-- Data for Name: _enums; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._enums (id, status, name, "_usersId", "_createdOn", "_organizationId") FROM stdin;
2	1	Node Type	1	2021-09-27 16:19:41	1
3	1	Field Display	1	2021-09-28 18:05:25	1
1	1	Field type	1	2016-03-28 07:20:37	0
\.


--
-- Data for Name: _fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._fields (id, name, status, "_usersId", "_createdOn", "_organizationId", "nodeFieldsLinker", show, prior, "fieldType", "fieldName", "selectFieldName", description, "maxLength", requirement, "unique", "forSearch", "storeInDb", "nodeRef", multilingual, "sendToServer", icon, height, enum, "lookupIcon", display, "cssClass") FROM stdin;
2	Section name in the plural	1	0	2025-08-18 10:44:08	0	4	255	22	1	name			127	1	0	1	1	0	1	1		0	0		0	
3	Section description	1	0	2025-08-18 10:44:06	0	4	5	25	1	description			65535	0	0	0	1	0	1	1		0	0		0	
5	Name	1	0	2025-08-18 10:44:01	0	5	255	2	1	name			64	1	0	1	1	0	0	1		0	0		0	
9	Name	1	0	2025-08-18 10:43:56	0	6	255	3	1	fieldName		Field`s name which used to store data in database and access field via scripts.	33	1	0	1	1	0	0	1		0	0		1	
11	Display Name	1	0	2025-08-18 10:43:52	0	6	255	2	1	name			128	0	0	1	1	0	1	1		0	0		0	
12	Field description 	1	0	2025-08-18 10:43:50	0	6	5	6	1	description			65000	0	0	0	1	0	1	1		0	0		0	
13	Section id	1	0	2025-08-18 10:43:48	0	4	254	1	2	id			15	0	0	1	1	0	0	1		0	0		0	
17	Organization name	1	0	2025-08-18 10:43:43	0	7	255	1	1	name			255	0	0	1	1	0	0	1		0	0		0	
18	Member of	1	0	2014-12-26 19:34:51	0	5	5	1042	7	_organizationId	_organization		7	0	0	1	1	7	0	1		0	0		0	
20	Field type	1	0	2025-08-18 10:43:38	0	6	7	73	6	fieldType			0	1	0	1	1	0	0	1		0	1		0	
27	Is Required	1	0	2025-08-18 10:43:01	0	6	5	137	5	requirement			0	0	0	0	1	0	0	1		0	0		1	
28	Is Unique value	1	0	2025-08-18 10:43:03	0	6	5	143	5	unique			0	0	0	0	1	0	0	1		0	0		1	
29	For search	1	0	2025-08-18 10:42:54	0	6	5	142	5	forSearch			0	0	0	1	1	0	0	1		0	0		1	
31	Priority	1	0	2025-08-18 10:42:52	0	6	5	5	2	prior			8	1	0	0	1	0	0	1		0	0		1	
32	Store in DB	1	0	2025-08-18 10:42:49	0	6	5	139	5	storeInDb			0	0	0	0	1	0	0	1	database	0	0		1	
33	Priority	1	0	2025-08-18 10:42:47	0	4	7	24	2	prior			8	1	0	0	1	0	0	1	sort-numeric-asc	0	0		1	
35	Captcha	1	0	2025-08-18 10:42:45	0	4	5	284	5	captcha			0	0	0	0	1	0	0	1	edit	0	0		1	
38	E-mail	1	0	2011-05-13 11:57:09	0	5	19	125	1	email			64	0	0	1	1	0	0	1		0	0		0	
40		1	0	2011-05-13 13:11:08	0	5	0	173	8	descSpl		<div id="noNeedLoginHere"></div> Fill information about your self:	0	0	0	0	0	0	0	0		0	0		0	
49	Notify on Email about new private messages	1	0	2014-12-30 14:49:56	0	5	1	339	5	mailing			0	0	0	0	1	0	0	1		0	0		1	
52	Parent document	1	0	2025-08-18 10:42:38	0	9	7	56	7	nodeFiltersLinker	_nodes		4	1	0	1	1	4	0	1		0	0		0	
53	Filter name	1	0	2014-11-28 15:16:09	0	9	255	2	1	name			40	1	0	1	1	0	1	1		0	0		0	
54	SQL condition	1	0	2014-11-28 15:17:21	0	9	7	23	1	filter			1024	0	0	0	1	0	0	1		0	0		0	
55	ViewName to select from	1	0	2014-11-28 15:18:21	0	9	7	34	1	view			127	0	0	1	1	0	0	1		0	0		0	
73	Draftable	1	0	2014-12-10 12:45:25	0	4	5	1354	5	draftable			0	0	0	0	1	0	0	1	pencil	0	0		1	
138	Sort by	1	0	2025-08-18 10:42:36	0	4	5	217	7	_fieldsId	_fields		6	0	0	1	1	6	0	1	sort-alpha-asc	0	0		1	
139	Activation code	1	0	2025-08-18 10:42:34	0	5	0	876	1	activation			16	0	0	0	1	0	0	1		0	0		0	
39	Confirm password	1	0	2011-05-13 12:43:08	0	5	1	130	10	passwordConfirm			128	0	0	0	0	0	0	0		0	0		0	
90	Select from DB name	1	0	2014-12-26 14:15:12	0	6	5	150	1	selectFieldName			127	0	0	0	1	0	0	1		0	0		0	
22	In Editable form	1	0	2014-12-20 14:42:21	0	6	5	165	5	visibilityCreate			0	0	0	0	0	0	0	0	edit	0	0		1	
23	In List	1	0	2025-08-18 10:43:33	0	6	5	167	5	visibilityList			0	0	0	0	0	0	0	0	list	0	0		1	
21	Visibility	1	0	2025-08-18 10:43:35	0	6	5	163	2	show			15	0	0	0	1	0	0	1		0	0		0	
24	In Read Only form	1	0	2025-08-18 10:43:30	0	6	5	166	5	visibilityView			0	0	0	0	0	0	0	0	search	0	0		1	
191	URL	1	0	2015-02-04 14:30:51	0	4	5	10341	1	staticLink			128	0	0	0	1	0	0	1		0	0		0	
196	First name	1	0	2015-02-10 13:18:52	0	5	0	188	1	firstName			20	0	0	0	1	0	0	1		0	0		0	
197	Last name	1	0	2015-02-10 13:40:46	0	5	0	187	1	lastName			32	0	0	1	1	0	0	1		0	0		0	
198	Mid name	1	0	2015-02-10 13:41:46	0	5	0	189	1	midName			24	0	0	1	1	0	0	1		0	0		0	
199	Company	1	0	2015-02-10 13:42:37	0	5	63	123	1	company			127	0	0	0	1	0	0	1		0	0		0	
200	Title	1	0	2015-02-10 13:43:32	0	5	5	124	1	title			200	0	0	0	1	0	0	1		0	0		0	
201	About	1	0	2015-02-10 13:44:21	0	5	5	126	1	description			2048	0	0	0	1	0	0	1		0	0		0	
202	Web site	1	0	2015-02-10 13:45:16	0	5	0	316	1	www			128	0	0	0	1	0	0	1		0	0		0	
243	Document name	1	0	2025-08-18 10:42:23	0	49	255	0	1	name			64	1	0	1	1	0	1	1		0	0		0	
244	Body	1	0	2015-11-11 09:13:52	0	49	5	91	19	body			8000999	0	0	0	1	0	1	1		999	0		0	
218	Common information	1	0	2015-02-25 13:24:25	0	5	5	1	17	mainTab			0	0	0	0	0	0	0	0	user	0	0		0	
221	Settings	1	0	2015-02-25 13:43:35	0	5	1	131	17	privilegesTab			0	0	0	0	0	0	0	1	cog	0	0		0	
4	Parent section	1	0	2025-08-18 10:44:03	0	4	7	23	7	_nodesId	_nodes	parent node id	4	1	0	1	1	4	0	1	sitemap	0	0		1	
6	Password	1	0	2025-08-18 10:43:59	0	5	1	129	10	password	('')		128	0	0	0	1	0	0	1		0	0		0	
26	Max length	1	0	2025-08-18 10:43:28	0	6	7	74	2	maxLength			8	0	0	1	1	0	0	1		0	0		0	
10	Parent Section	1	0	2025-08-18 10:43:54	0	6	7	115	7	nodeFieldsLinker	_nodes	parent node	4	1	0	1	1	4	0	1		0	0		0	
59	Avatar	1	0	2014-12-16 16:16:57	0	5	63	1	12	avatar			2000200	0	0	0	1	0	0	1		200	0		0	
245	Link	1	0	2015-11-11 09:34:51	0	49	5	21	1	link			0	0	0	0	0	0	0	1		0	0		0	
246	File name	1	0	2015-11-11 10:17:47	0	49	5	32	1	title			127	1	1	0	1	0	0	1		0	0		0	
1	Document name in the singular	1	0	2014-12-03 03:47:56	0	4	5	162	1	singleName			127	0	0	1	1	0	1	1		0	0		0	
36	Role name	1	0	2025-08-18 10:42:43	0	8	255	1	1	name			45	1	1	1	1	0	1	1		0	0		0	
252	Records per page	1	0	2016-02-08 19:39:22	0	4	5	264	2	recPerPage			3	0	0	0	1	0	0	1		0	0		1	
256	Icon	1	0	2025-08-18 10:42:01	0	6	5	4	1	icon			24	0	0	0	1	0	0	1		0	0		1	
287	Roles	1	1	2016-03-14 13:31:44	0	5	1	127	14	_userRoles	_roles		0	0	0	0	1	8	0	1		0	0		0	
295	Creation name	1	1	2016-03-21 07:15:14	0	4	1	202	1	creationName		Name which will be used on creation page. Useful for some not English languages. You can keep this field empty.	64	0	0	0	1	0	1	1		0	0		0	
310	Name	1	0	2016-03-28 07:20:08	0	52	255	1	1	name			64	1	0	1	1	0	1	1		0	0		0	
311	Display name	1	0	2016-03-28 07:46:54	0	53	255	10	1	name			64	1	0	1	1	0	1	1		0	0		0	
312	Value	1	1	2016-03-28 07:52:09	0	53	47	31	2	value			11	0	0	1	1	0	0	1		0	0		0	
314	List	1	1	2016-03-28 07:57:51	0	52	5	21	15	values			0	0	0	0	0	53	0	1		0	0		0	
315	Enumeration	1	1	2016-03-28 07:57:52	0	53	1	1050	7	valuesLinker	_enums		0	0	0	1	1	52	0	1		0	0		0	
316	Enumeration	1	1	2016-03-28 08:26:41	0	6	5	115	7	enum	_enums		0	0	0	0	1	52	0	1		0	0		0	
325	Multilingual field	1	1	2016-04-19 14:05:25	0	6	7	143	5	multilingual			0	0	0	1	1	0	0	1	language	0	0		1	
326	Name	1	0	2016-04-19 14:10:20	0	12	255	1	1	name			64	1	0	1	1	0	0	1		0	0		0	
327	Lang code (en, ru, ...)	1	1	2016-04-19 14:11:58	0	12	7	11	1	code			2	0	1	1	1	0	0	1		0	0		0	
328	Multilingual enabled	1	1	2016-04-22 13:31:08	0	5	0	247	5	multilingualEnabled			0	0	0	0	1	0	0	1		0	0		0	
345		1	1	2016-05-04 08:02:22	0	4	5	10363	15	nodeFields			0	0	0	0	0	6	0	1		0	0		0	
352	Reverse sorting	1	1	2016-05-16 07:41:01	0	4	5	218	5	reverse			0	0	0	0	1	0	0	1	sort-alpha-desc	0	0		1	
397	Icon	1	1	2016-08-09 07:13:55	0	4	5	22	1	icon			24	0	0	0	1	0	0	1	photo	0	0		1	
251	Users	1	0	2016-02-07 18:14:02	0	7	5	82	14	_organizationUsers	_users		5	0	0	0	1	5	0	1		0	0	avatar	0	
318	In Drop-Down List	1	1	2016-04-05 08:27:23	0	6	5	170	5	visibilityDropdownList			0	0	0	0	0	0	0	0	list-alt	0	0		1	
573	High priority query	1	1	2017-03-28 08:47:55	0	9	3	22	5	hiPriority			1	0	0	0	1	0	0	1		0	0		0	
651	Additional SELECT fields	1	1	2017-07-03 05:10:13	33	9	3	24	1	fields			255	0	0	0	1	0	0	1		0	0		0	
656	UI Language	1	1	2018-01-04 23:02:24	1	5	1	132	7	language	_languages		0	0	0	1	1	12	0	1		0	0	langIcon	0	
657	Icon	1	1	2018-01-04 23:20:41	1	12	63	2	12	langIcon			600030	0	0	0	1	0	0	1		30	0		0	
658	Width	1	1	2018-01-12 21:54:03	1	6	1	144	2	width			5	0	0	0	0	0	0	0		0	0		0	
659	Height	1	1	2018-01-12 21:55:34	1	6	5	145	2	height			4	0	0	0	1	0	0	1		0	0		0	
665	Name	1	0	2021-07-02 15:26:32	0	83	255	0	1	name			64	1	0	1	1	0	0	1		0	0		0	
666	Created on	1	0	2021-07-02 15:26:32	0	83	62	1	4	_createdOn			0	0	0	1	1	0	0	1		0	0		0	
667	Organization	1	0	2021-07-02 15:26:32	0	83	6	22	7	_organizationId	_organization		0	0	0	1	1	7	0	1		0	0		0	
668	Owner	1	0	2021-07-02 15:26:32	0	83	6	23	7	_usersId	_users		0	0	0	1	1	5	0	1		0	0	avatar	0	
669	File	1	1	2021-07-02 15:28:04	1	83	63	11	21	file			0	1	0	1	1	0	0	1		0	0		0	
728	order	1	1	2021-07-20 17:27:45	1	53	59	41	2	order		to have ordering in 1toN lookups, just add field 'order'  to target node.	9	0	0	1	1	0	0	1		0	0		0	
752	Filter id	1	0	2025-08-18 10:41:51	0	9	254	1	2	id			15	0	0	1	1	0	0	1		0	0		0	
753	Default filter	1	1	2021-09-13 15:34:29	1	4	5	263	7	defaultFilterId	_filters		0	0	0	1	1	9	0	1	filter	0	0		0	
754	Field id	1	0	2025-08-18 10:41:49	0	6	254	1	2	id			15	0	0	1	1	0	0	1		0	0		0	
755	Language id	1	0	2019-01-18 10:37:40	0	12	254	0	2	id			15	0	0	1	1	0	0	1		0	0		0	
800	Store forms in DB	1	1	2021-09-17 21:10:57	1	4	7	149	5	storeForms			0	0	0	1	1	0	0	1	database	0	0		1	
801	Username	1	1	2021-09-19 11:59:38	1	20	255	14	1	username			64	1	0	0	0	0	0	1		0	0		0	
802	Password	1	1	2021-09-19 12:16:52	1	20	63	15	10	password			128	1	0	0	0	0	0	1		0	0		0	
803	 	1	1	2021-09-22 14:14:05	1	49	1	31	8	clickableLink		<a class="clickable-link" target="_blank"><span class="clickable-link-text">link</span></a>	0	0	0	0	0	0	0	0		0	0		0	
804	Username	1	1	2021-09-22 15:49:00	1	21	0	11	1	name			64	0	0	0	1	0	0	1		0	0		0	
805	Password	1	1	2021-09-22 15:49:38	1	21	1	22	10	password			128	1	0	0	1	0	0	1		0	0		0	
807	Email	1	1	2021-09-22 16:41:21	1	21	63	21	1	email			64	1	0	0	1	0	0	1		0	0		0	
808	salt	1	1	2021-09-22 17:43:09	1	21	0	101	1	salt			32	0	0	0	1	0	0	1		0	0		0	
809	activationKey	1	1	2021-09-22 17:44:03	1	21	0	81	1	activationKey			48	0	0	1	1	0	0	1		0	0		0	
813	Email	1	1	2021-09-23 16:16:58	1	22	1	35	1	email			64	1	0	0	0	0	0	1		0	0		0	
814	salt	1	1	2021-09-22 17:43:09	1	5	0	101	1	salt			32	0	0	0	1	0	0	1		0	0		0	
815	Node type	1	1	2021-09-27 16:26:21	1	4	63	109	6	nodeType			0	1	0	1	1	0	0	1		0	2		0	
343	Properties	1	1	2016-05-04 07:59:18	0	4	5	10352	17	propertyTab			0	0	0	0	0	0	0	1	cog	0	0		0	
660	Common	1	1	2016-03-14 09:11:03	0	7	5	0	17	commonTab			0	0	0	0	0	0	0	1	tags	0	0		0	
253	Related Section	1	0	2015-03-16 12:36:21	0	6	5	94	7	nodeRef	_nodes	node lookup field points to	0	0	0	1	1	4	0	1		0	0		0	
820	Enumeration id	1	0	2025-08-18 10:41:40	0	52	2	0	2	id			15	1	0	1	1	0	0	1		0	0		0	
823	Display	1	1	2021-09-28 18:06:12	1	6	1	16	6	display			0	0	0	0	1	0	0	1		0	3		1	
824		1	1	2016-05-04 08:02:22	0	4	5	10368	15	nodeFilters			0	0	0	0	0	9	0	1		0	0		0	
826	Additional CSS class	1	1	2021-10-21 09:54:50	1	6	5	26	1	cssClass		Separate multiply classes with space	128	0	0	0	1	0	0	1		0	0		1	
288	Role owners	1	1	2016-03-14 13:31:44	0	8	5	187	14	_userRoles	_users		0	0	0	0	1	5	0	1		0	0	avatar	0	
827	Additional CSS class	1	1	2021-10-21 10:22:29	1	4	5	1364	1	cssClass		Separate multiply classes with space	128	0	0	0	1	0	0	1		0	0		1	
806	Repeat password	1	1	2021-09-22 15:50:30	1	21	1	51	10	passwordConfirm			128	1	0	0	0	0	0	0		0	0		0	
811	Already have an account?	1	1	2021-09-23 15:35:07	1	21	1	61	18	alreadyHaveAccountBtn			0	0	0	0	0	0	0	0		0	0		0	link-button-field
819	Appearance settings	1	1	2021-09-28 13:42:55	1	4	1	161	22	appearanceGroup			0	0	0	0	0	0	0	0		0	0		0	
822	Field visibility	1	1	2021-09-28 15:29:10	1	6	1	152	22	visibilitySplitter			0	0	0	0	0	0	0	0	eye	0	0		0	
821	Data storage settings	1	1	2021-09-28 15:27:47	1	6	1	73	22	storageSettingSplitter			0	0	0	0	0	0	0	0	database	0	0		0	
818	Data storage settings	1	1	2021-09-28 13:42:06	1	4	1	119	22	dataStorageGroup			0	0	0	0	0	0	0	0	database	0	0		0	
816	Lookup icon select name	1	1	2021-09-28 11:54:22	1	6	1	151	1	lookupIcon			33	0	0	0	1	0	0	1		0	0		0	
810	Forgot my password	1	1	2021-09-23 15:31:06	1	20	63	27	18	forgotPasswordButton			0	0	0	0	0	0	0	0		0	0		1	link-button-field
828	I change my mind	1	1	2021-10-22 13:46:41	1	22	1	45	18	backToLogin			0	0	0	0	0	0	0	0		0	0		1	link-button-field
812	Sign up	1	1	2021-09-23 15:46:53	1	20	1	28	18	signUpLinkBtn			0	0	0	0	0	0	0	0		0	0		1	link-button-field
832	Roles	1	1	2021-11-05 14:18:07	1	9	5	86	14	_filterAccessRoles	_roles		0	0	0	1	1	8	0	1	user	0	0		0	
833	Order	1	1	2021-11-05 14:43:01	1	9	5	66	2	order			7	0	0	1	1	0	0	1	sort-numeric-asc	0	0		0	
831	In Sub-Form List	1	1	2021-10-29 11:49:54	1	6	7	179	5	visibilitySubFormList			0	0	0	0	0	0	0	0	list-ul	0	0		1	
829	Or sign with:	1	1	2021-10-23 11:54:27	1	20	1	26	8	socialLoginButtons			0	0	0	0	0	0	0	0	0	0	0		0	
830	Sign In	1	1	2021-10-26 15:23:00	1	20	1	25	18	signInBtn			0	0	0	0	0	0	0	0	sign-in	0	0		0	sign-in-button
861	Name	1	0	2025-08-24 16:08:02.26454	1	121	65535	0	1	name			64	1	0	1	1	0	0	1		0	0		0	
357	In Custom-View List	1	0	2025-08-18 10:42:05	0	6	5	168	5	visibilityCustomList			0	0	0	0	0	0	0	0	th	0	0		1	
344	Fields	1	1	2016-05-04 08:00:39	0	4	5	10362	17	fieldsTab			0	0	0	0	0	0	0	1	list	0	0		0	
825	Filters	1	1	2016-05-04 08:00:39	0	4	5	10366	17	filtersTab			0	0	0	0	0	0	0	1	list	0	0		0	
222	Change Password	1	0	2015-02-25 13:46:11	0	5	1	128	17	passwordTab			0	0	0	0	0	0	0	1	key	0	0		0	
664	Members	1	1	2018-01-13 16:54:01	1	7	5	2	17	membersTab			0	0	0	0	0	0	0	1	users	0	0		0	
751	Is UI language	1	1	2021-09-13 14:10:19	1	12	7	21	5	isUILanguage		Used to load localization data for user UI. locales/xx/lang.ts	2	0	0	1	1	0	0	1		0	0		0	
486	Send to server	1	1	2016-10-28 09:12:28	0	6	1	138	5	sendToServer		If 0 - data of this field will not be sent to server and uses only for client side operating.	0	0	0	1	1	0	0	1	upload	0	0		1	
862	Created on	1	0	2025-08-24 16:08:02.265224	1	121	6	270	4	_createdOn			0	0	0	1	1	0	0	1		0	0		0	
863	Organization	1	0	2025-08-24 16:08:02.266147	1	121	6	280	7	_organizationId	_organization		0	0	0	1	1	7	0	1		0	0		0	
864	Owner	1	0	2025-08-24 16:08:02.266578	1	121	6	290	7	_usersId	_users		0	0	0	1	1	5	0	1		0	0	avatar	0	
867	datetime	1	1	2025-09-05 17:34:39.460409	1	121	39	1	4	dttm			0	0	0	0	1	0	0	1		0	0		0	
14	Node name (table name)	1	0	2025-08-18 10:43:46	0	4	7	160	1	tableName			24	0	0	0	1	0	0	1		0	0		1	
37	Description	1	0	2011-05-10 16:15:46	0	8	47	164	1	description			3000	0	0	0	1	0	1	1		0	0		0	
868	Default page	1	1	2025-09-22 17:02:14.716587	1	8	39	2	7	defaultPage	_nodes		0	0	0	1	1	4	0	1		0	0		0	
\.


--
-- Data for Name: _files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._files (id, status, name, "_usersId", "_createdOn", "_organizationId", file) FROM stdin;
\.


--
-- Data for Name: _filterAccessRoles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_filterAccessRoles" ("_filtersId", "_rolesId", id) FROM stdin;
\.


--
-- Data for Name: _filters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._filters (id, status, "_usersId", "_createdOn", "_organizationId", "nodeFiltersLinker", name, filter, view, "hiPriority", fields, "order") FROM stdin;
8	1	1	2021-09-13 15:08:39	1	4	Can have filter	(_nodes."nodeType" = 2 AND _nodes."storeForms" = 1)		0		0
\.


--
-- Data for Name: _html; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._html (id, status, name, "_usersId", "_createdOn", "_organizationId", body, title) FROM stdin;
\.


--
-- Data for Name: _languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._languages (id, status, name, "_usersId", "_createdOn", "_organizationId", code, "langIcon", "isUILanguage") FROM stdin;
1	1	English	1	2016-04-19 14:12:10	0		57/5592b6e226551.jpg	1
\.


--
-- Data for Name: _nodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._nodes (id, "nodeType", "_nodesId", status, "tableName", "singleName", name, description, prior, "_usersId", "_createdOn", captcha, "_organizationId", draftable, "_fieldsId", "staticLink", "recPerPage", icon, "creationName", reverse, "defaultFilterId", "storeForms", "cssClass") FROM stdin;
2	1	0	1		Root	Root		12	0	2000-06-18 10:38:54	0	0	0	0		10			0	0	0	
6	2	10	1	_fields	Field	Fields		11	0	1999-01-12 10:38:32	0	0	1	10		20	edit		0	0	1	
9	2	10	1	_filters	Filter	Filters		55	0	2014-12-03 04:05:15	0	0	1	752		40	filter		1	0	1	
12	2	10	1	_languages	Language	Languages		995	1	2016-04-19 14:10:20	0	0	0	0		25	flag		0	0	1	
50	1	0	1		Hidden section	Hidden sections		0	0	2015-12-24 12:16:16	0	0	0	0		10			0	0	0	
53	2	50	1	_enumValues	Enumeration value	Enumeration values		994	1	2016-03-28 07:46:54	0	0	0	312		25			0	0	1	
5	2	3	1	_users	User	Users		30	0	2014-12-03 04:04:55	0	0	0	0		50	user		0	0	1	
8	2	3	1	_roles	Role	Roles		40	0	2011-05-05 14:36:20	0	0	0	0		10	id-badge		0	0	1	
7	2	3	1	_organization	Organization	Organizations		50	0	2000-01-18 10:38:17	0	0	0	0		10	institution		0	0	1	
52	2	3	1	_enums	Enumeration	Enumerations		80	1	2016-03-28 07:20:08	0	0	0	0		25	list		0	0	1	
49	2	3	1	_html	Page	Pages		70	0	2015-11-11 09:11:54	0	0	0	193		10	file-o		0	0	1	
123	2	3	1	myRecordsNoTable		Records with no table		10	1	2025-08-25 10:12:38.36154	0	1	0	0		25	power-off		0	0	0	
4	2	10	1	_nodes	Section	Sections	Website's section	9	0	2014-12-19 12:18:48	0	0	1	13		25	sitemap	Add new section	1	0	1	
121	2	3	1	myRecords	My Record	My Records		20	1	2025-08-24 16:08:02.257703	0	1	0	862		25	music		1	0	1	
1	4	50	1	AdminRolePrivilegesForm	Right access form	Right access form		994	1	2016-03-15 08:17:01	0	0	0	0		25			0	0	0	
83	2	3	1	_files	File	Files		60	1	2021-07-02 18:26:32	0	1	0	0		25	file		0	0	1	
20	2	50	1	_login	 Sign-in	 Sign-in		1	1	2021-09-19 11:48:43	1	1	0	0		25	sign-in		0	0	0	login-form
22	2	50	1	_resetPassword	Reset password	Reset password		12	1	2021-09-23 16:16:23	1	1	0	0		25			0	0	0	login-form
21	2	50	1	_registration	Create a New Account	Create a New Account		22	1	2021-09-22 16:13:47	1	1	0	0		25	check		0	0	1	login-form
10	1	2	1		Deep Administration	Deep Administration	Danger zone. Please make changes here only if you know what you doing.	1373	0	2014-12-23 18:44:46	0	0	0	0		10			0	0	0	
3	1	2	1		Administration	Administration		480	0	2014-12-03 04:04:55	0	0	0	0		10			0	0	0	
\.


--
-- Data for Name: _organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._organization (id, name, status, "_usersId", "_createdOn", "_organizationId") FROM stdin;
2	guest group	1	0	2025-08-18 10:39:53	2
3	user group	1	0	2025-08-18 10:39:59	3
8	123123123	0	1	2025-08-24 10:46:59.233879	1
1	admin group	1	0	2025-08-18 10:39:45	1
\.


--
-- Data for Name: _organizationUsers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_organizationUsers" ("_organizationId", "_usersId", id) FROM stdin;
2	1	2
\.


--
-- Data for Name: _registration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._registration (id, status, name, "_usersId", "_createdOn", "_organizationId", password, email, salt, "activationKey") FROM stdin;
\.


--
-- Data for Name: _rolePrivileges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_rolePrivileges" ("nodeId", "roleId", privileges) FROM stdin;
0	1	65535
2	2	4
12	2	7
20	2	4
21	2	12
22	2	4
49	2	4
81	2	8
83	2	4
2	3	4
5	3	17
11	3	1
12	3	7
22	3	4
49	3	4
81	3	8
83	3	4
0	7	7
\.


--
-- Data for Name: _roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._roles (id, name, status, "_createdOn", "_usersId", description, "_organizationId", "defaultPage") FROM stdin;
3	User	1	2014-12-12 18:39:47	1	Role assigned to each authorized user	0	0
7	View all	1	2016-03-07 03:00:00	1	Read only access to all sections	0	0
1	Super admin	1	2025-08-07 10:40:13	1	Full access for all sections	0	4
2	Guest	1	2014-12-15 13:07:32	1	Role assigned to each unauthorized user	0	20
\.


--
-- Data for Name: _userRoles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_userRoles" ("_usersId", "_rolesId", id) FROM stdin;
1	1	1
\.


--
-- Data for Name: _users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._users (id, name, "_organizationId", password, salt, status, "blockedTo", mistakes, "_usersId", "_createdOn", email, mailing, avatar, "resetCode", "resetTime", "firstName", "lastName", "midName", company, title, description, "multilingualEnabled", "defaultOrg", language) FROM stdin;
2	guest	2	ncL4DFn76ds5yhg		1	2001-01-09 03:00:00	3	1	2014-12-07 12:43:13		0			2021-10-06 13:22:23				guest group	guest		0	2	0
18	myuser	4	123	123	0	2025-08-05 11:17:57	2	4	2025-08-24 11:20:12.91936	123@123.123	1	123/123.jpg	123123	2025-08-21 11:18:44	123	123	123	123	123	123	0	3	0
1	admin	1	fdff7e2a05a72247f79c03db873600fd3007daae25ef622764af99370bff68064464f5795308dee50e915f1309b17a250d6941964cba825e90cba2b2166eb10f	298d8db20497d27d9b77d1733271c188	1	2025-09-19 17:06:35.515177	1	1	2014-12-30 14:54:50	admin	1	d2/9f81723b2e32e.png		2025-09-22 15:26:54.630116				admin group		123	0	1	0
3	user	3	ncL4DFn76ds5yhg		1	2001-01-19 03:00:00	2	1	2014-12-10 13:09:02		1	2e/44dafabea257a.jpg		2021-07-30 00:00:00				user group			0	3	0
\.


--
-- Data for Name: myRecords; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."myRecords" (id, status, name, "_usersId", "_createdOn", "_organizationId", dttm) FROM stdin;
1	0	rtrtrthtrhrthr	1	2025-08-24 17:58:12.871604	1	0385-07-25 08:56:56
2	1	My Record 1	1	2025-09-01 21:43:40.008248	1	2025-06-08 09:09:00
\.


--
-- Name: _enumsidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._enumsidseq', 4, true);


--
-- Name: _enumvaluesidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._enumvaluesidseq', 55, true);


--
-- Name: _fieldsidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._fieldsidseq', 868, true);


--
-- Name: _filesidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._filesidseq', 1, true);


--
-- Name: _filteraccessrolesidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._filteraccessrolesidseq', 1, false);


--
-- Name: _filtersidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._filtersidseq', 10, true);


--
-- Name: _htmlidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._htmlidseq', 1, true);


--
-- Name: _languagesidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._languagesidseq', 2, true);


--
-- Name: _nodesidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._nodesidseq', 123, true);


--
-- Name: _organizationidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._organizationidseq', 12, true);


--
-- Name: _organizationusersidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._organizationusersidseq', 4, true);


--
-- Name: _registrationidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._registrationidseq', 1, true);


--
-- Name: _rolesidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._rolesidseq', 16, true);


--
-- Name: _userrolesidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._userrolesidseq', 2, true);


--
-- Name: _usersidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._usersidseq', 18, true);


--
-- Name: myrecordsidseq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.myrecordsidseq', 2, true);


--
-- Name: _enumValues _enumValuesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_enumValues"
    ADD CONSTRAINT "_enumValuesPkey" PRIMARY KEY (id);


--
-- Name: _enums _enumsPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._enums
    ADD CONSTRAINT "_enumsPkey" PRIMARY KEY (id);


--
-- Name: _fields _fieldsPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._fields
    ADD CONSTRAINT "_fieldsPkey" PRIMARY KEY (id);


--
-- Name: _files _filesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._files
    ADD CONSTRAINT "_filesPkey" PRIMARY KEY (id);


--
-- Name: _filterAccessRoles _filterAccessRolesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_filterAccessRoles"
    ADD CONSTRAINT "_filterAccessRolesPkey" PRIMARY KEY ("_filtersId", "_rolesId");


--
-- Name: _filters _filtersPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._filters
    ADD CONSTRAINT "_filtersPkey" PRIMARY KEY (id);


--
-- Name: _html _htmlPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._html
    ADD CONSTRAINT "_htmlPkey" PRIMARY KEY (id);


--
-- Name: _languages _languagesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._languages
    ADD CONSTRAINT "_languagesPkey" PRIMARY KEY (id);


--
-- Name: _nodes _nodesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._nodes
    ADD CONSTRAINT "_nodesPkey" PRIMARY KEY (id);


--
-- Name: _organization _organizationPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._organization
    ADD CONSTRAINT "_organizationPkey" PRIMARY KEY (id);


--
-- Name: _organizationUsers _organizationUsersPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_organizationUsers"
    ADD CONSTRAINT "_organizationUsersPkey" PRIMARY KEY ("_organizationId", "_usersId");


--
-- Name: _registration _registrationPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._registration
    ADD CONSTRAINT "_registrationPkey" PRIMARY KEY (id);


--
-- Name: _rolePrivileges _rolePrivilegesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_rolePrivileges"
    ADD CONSTRAINT "_rolePrivilegesPkey" PRIMARY KEY ("roleId", "nodeId");


--
-- Name: _roles _rolesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._roles
    ADD CONSTRAINT "_rolesPkey" PRIMARY KEY (id);


--
-- Name: _userRoles _userRolesPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_userRoles"
    ADD CONSTRAINT "_userRolesPkey" PRIMARY KEY ("_usersId", "_rolesId");


--
-- Name: _users _usersPkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._users
    ADD CONSTRAINT "_usersPkey" PRIMARY KEY (id);


--
-- Name: myRecords myRecordsKey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."myRecords"
    ADD CONSTRAINT "myRecordsKey" PRIMARY KEY (id);


--
-- Name: _createdOn; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_createdOn" ON public."_enumValues" USING btree ("_createdOn");


--
-- Name: _enumsCreatedOn; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_enumsCreatedOn" ON public._enums USING btree ("_createdOn");


--
-- Name: _enumsOrganizationId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_enumsOrganizationId" ON public._enums USING hash ("_organizationId");


--
-- Name: _enumsUsersId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_enumsUsersId" ON public._enums USING hash ("_usersId");


--
-- Name: _filterAccessRolesFiltersId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_filterAccessRolesFiltersId" ON public."_filterAccessRoles" USING hash ("_filtersId");


--
-- Name: _filterAccessRolesRolesId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_filterAccessRolesRolesId" ON public."_filterAccessRoles" USING hash ("_rolesId");


--
-- Name: _organizationId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_organizationId" ON public."_enumValues" USING btree ("_organizationId");


--
-- Name: _organizationUsersOrganizationId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_organizationUsersOrganizationId" ON public."_organizationUsers" USING hash ("_organizationId");


--
-- Name: _organizationUsersUsersId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_organizationUsersUsersId" ON public."_organizationUsers" USING hash ("_usersId");


--
-- Name: _userRoles_rolesIdIdx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_userRoles_rolesIdIdx" ON public."_userRoles" USING hash ("_rolesId");


--
-- Name: _userRoles_usersIdIdx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_userRoles_usersIdIdx" ON public."_userRoles" USING hash ("_usersId");


--
-- Name: _usersId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_usersId" ON public."_enumValues" USING btree ("_usersId");


--
-- Name: ind__roles_defaultPage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ind__roles_defaultPage" ON public._roles USING hash ("defaultPage");


--
-- Name: myRecordsCreatedOn; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "myRecordsCreatedOn" ON public."myRecords" USING btree ("_createdOn");


--
-- Name: myRecordsOrganizationId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "myRecordsOrganizationId" ON public."myRecords" USING hash ("_organizationId");


--
-- Name: myRecordsUsersId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "myRecordsUsersId" ON public."myRecords" USING hash ("_usersId");


--
-- Name: order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order" ON public."_enumValues" USING btree ("order");


--
-- Name: value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX value ON public."_enumValues" USING btree (value);


--
-- Name: valuesLinker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "valuesLinker" ON public."_enumValues" USING btree ("valuesLinker");


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict pZESvrtPH5Gmoqb1VgrmsQzhw8yDi6tL8b2d3vqnbXmUMOGiYGjkfXNMgh2twyj

