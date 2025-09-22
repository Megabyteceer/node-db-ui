/*
 Navicat Premium Dump SQL

 Source Server         : local
 Source Server Type    : PostgreSQL
 Source Server Version : 170006 (170006)
 Source Host           : localhost:5432
 Source Catalog        : postgres
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170006 (170006)
 File Encoding         : 65001

 Date: 17/09/2025 22:26:26
*/


-- ----------------------------
-- Sequence structure for _enumsidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_enumsidseq";
CREATE SEQUENCE "public"."_enumsidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _enumvaluesidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_enumvaluesidseq";
CREATE SEQUENCE "public"."_enumvaluesidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _fieldsidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_fieldsidseq";
CREATE SEQUENCE "public"."_fieldsidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _filesidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_filesidseq";
CREATE SEQUENCE "public"."_filesidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _filteraccessrolesidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_filteraccessrolesidseq";
CREATE SEQUENCE "public"."_filteraccessrolesidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _filtersidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_filtersidseq";
CREATE SEQUENCE "public"."_filtersidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _htmlidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_htmlidseq";
CREATE SEQUENCE "public"."_htmlidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _languagesidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_languagesidseq";
CREATE SEQUENCE "public"."_languagesidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _nodesidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_nodesidseq";
CREATE SEQUENCE "public"."_nodesidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _organizationidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_organizationidseq";
CREATE SEQUENCE "public"."_organizationidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _organizationusersidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_organizationusersidseq";
CREATE SEQUENCE "public"."_organizationusersidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _registrationidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_registrationidseq";
CREATE SEQUENCE "public"."_registrationidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _rolesidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_rolesidseq";
CREATE SEQUENCE "public"."_rolesidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _userrolesidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_userrolesidseq";
CREATE SEQUENCE "public"."_userrolesidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _usersidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_usersidseq";
CREATE SEQUENCE "public"."_usersidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for myrecordsidseq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."myrecordsidseq";
CREATE SEQUENCE "public"."myrecordsidseq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for _enumValues
-- ----------------------------
DROP TABLE IF EXISTS "public"."_enumValues";
CREATE TABLE "public"."_enumValues" (
  "id" int4 NOT NULL DEFAULT nextval('_enumvaluesidseq'::regclass),
  "status" int2 NOT NULL,
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "value" int4 NOT NULL,
  "valuesLinker" int4 NOT NULL,
  "order" int4 NOT NULL
)
;

-- ----------------------------
-- Records of _enumValues
-- ----------------------------
INSERT INTO "public"."_enumValues" VALUES (16, 1, 'Tab', 1, '2016-03-28 08:07:02', 0, 17, 1, 12);
INSERT INTO "public"."_enumValues" VALUES (14, 1, 'Button', 1, '2016-03-28 08:07:02', 0, 18, 1, 13);
INSERT INTO "public"."_enumValues" VALUES (17, 1, 'HTML editor', 1, '2016-03-28 08:07:02', 0, 19, 1, 14);
INSERT INTO "public"."_enumValues" VALUES (5, 1, 'Enum', 1, '2016-03-28 08:05:09', 0, 6, 1, 4);
INSERT INTO "public"."_enumValues" VALUES (44, 1, 'Section', 1, '2021-09-27 16:24:25', 1, 1, 2, 0);
INSERT INTO "public"."_enumValues" VALUES (45, 1, 'Document', 1, '2021-09-27 16:24:25', 1, 2, 2, 1);
INSERT INTO "public"."_enumValues" VALUES (46, 1, 'Static Link', 1, '2021-09-27 17:14:37', 1, 3, 2, 2);
INSERT INTO "public"."_enumValues" VALUES (47, 1, 'React class', 1, '2021-09-27 17:30:09', 1, 4, 2, 3);
INSERT INTO "public"."_enumValues" VALUES (48, 1, 'Block', 1, '2021-09-28 18:05:25', 1, 0, 3, 0);
INSERT INTO "public"."_enumValues" VALUES (49, 1, 'Inline', 1, '2021-09-28 18:05:25', 1, 1, 3, 1);
INSERT INTO "public"."_enumValues" VALUES (30, 1, 'Color', 1, '2016-10-13 10:56:29', 0, 20, 1, 15);
INSERT INTO "public"."_enumValues" VALUES (50, 1, 'Splitter', 1, '2021-09-29 13:04:14', 1, 22, 1, 17);
INSERT INTO "public"."_enumValues" VALUES (43, 1, 'File', 1, '2016-10-13 10:56:29', 0, 21, 1, 16);
INSERT INTO "public"."_enumValues" VALUES (4, 1, 'Bool', 1, '2016-03-28 08:05:09', 0, 5, 1, 3);
INSERT INTO "public"."_enumValues" VALUES (1, 1, 'Text', 1, '2016-03-28 08:05:09', 0, 1, 1, 0);
INSERT INTO "public"."_enumValues" VALUES (2, 1, 'Number', 1, '2016-03-28 08:05:09', 0, 2, 1, 1);
INSERT INTO "public"."_enumValues" VALUES (3, 1, 'DateTime', 1, '2016-03-28 08:05:09', 0, 4, 1, 2);
INSERT INTO "public"."_enumValues" VALUES (13, 1, 'Lookup N to M', 1, '2016-03-28 08:05:10', 0, 14, 1, 10);
INSERT INTO "public"."_enumValues" VALUES (6, 1, 'Lookup', 1, '2016-03-28 08:05:09', 0, 7, 1, 5);
INSERT INTO "public"."_enumValues" VALUES (7, 1, 'Static HTML block', 1, '2016-03-28 08:05:09', 0, 8, 1, 6);
INSERT INTO "public"."_enumValues" VALUES (18, 1, 'Lookup 1 to N', 1, '2016-03-28 08:07:02', 0, 15, 1, 11);
INSERT INTO "public"."_enumValues" VALUES (9, 1, 'Password', 1, '2016-03-28 08:05:09', 0, 10, 1, 7);
INSERT INTO "public"."_enumValues" VALUES (11, 1, 'Image', 1, '2016-03-28 08:05:09', 0, 12, 1, 9);
INSERT INTO "public"."_enumValues" VALUES (10, 1, 'Date', 1, '2016-03-28 08:05:09', 0, 11, 1, 8);

-- ----------------------------
-- Table structure for _enums
-- ----------------------------
DROP TABLE IF EXISTS "public"."_enums";
CREATE TABLE "public"."_enums" (
  "id" int4 NOT NULL DEFAULT nextval('_enumsidseq'::regclass),
  "status" int2 NOT NULL,
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL
)
;

-- ----------------------------
-- Records of _enums
-- ----------------------------
INSERT INTO "public"."_enums" VALUES (2, 1, 'Node Type', 1, '2021-09-27 16:19:41', 1);
INSERT INTO "public"."_enums" VALUES (3, 1, 'Field Display', 1, '2021-09-28 18:05:25', 1);
INSERT INTO "public"."_enums" VALUES (1, 1, 'Field type', 1, '2016-03-28 07:20:37', 0);

-- ----------------------------
-- Table structure for _fields
-- ----------------------------
DROP TABLE IF EXISTS "public"."_fields";
CREATE TABLE "public"."_fields" (
  "id" int4 NOT NULL DEFAULT nextval('_fieldsidseq'::regclass),
  "name" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
  "status" int2 NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "nodeFieldsLinker" int4 NOT NULL,
  "show" int4 NOT NULL DEFAULT 0,
  "prior" int4 NOT NULL,
  "fieldType" int4 NOT NULL,
  "fieldName" varchar(33) COLLATE "pg_catalog"."default" NOT NULL,
  "selectFieldName" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "description" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::text,
  "maxLength" int4 NOT NULL DEFAULT 0,
  "requirement" int2 NOT NULL DEFAULT 0,
  "unique" int2 NOT NULL DEFAULT 0,
  "forSearch" int2 NOT NULL DEFAULT 0,
  "storeInDb" int2 NOT NULL DEFAULT 0,
  "nodeRef" int4 NOT NULL DEFAULT 0,
  "multilingual" int2 NOT NULL DEFAULT 0,
  "sendToServer" int2 NOT NULL DEFAULT 1,
  "icon" varchar(24) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "height" int4 NOT NULL DEFAULT 0,
  "enum" int4 NOT NULL DEFAULT 0,
  "lookupIcon" varchar(33) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "display" int4 NOT NULL DEFAULT 0,
  "cssClass" varchar(128) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying
)
;

-- ----------------------------
-- Records of _fields
-- ----------------------------
INSERT INTO "public"."_fields" VALUES (1, 'Document name in the singular', 1, 0, '2014-12-03 03:47:56', 0, 4, 7, 162, 1, 'singleName', '', '', 127, 0, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (2, 'Section name in the plural', 1, 0, '2025-08-18 10:44:08', 0, 4, 255, 22, 1, 'name', '', '', 127, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (3, 'Section description', 1, 0, '2025-08-18 10:44:06', 0, 4, 5, 25, 1, 'description', '', '', 65535, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (5, 'Name', 1, 0, '2025-08-18 10:44:01', 0, 5, 255, 2, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (9, 'Name', 1, 0, '2025-08-18 10:43:56', 0, 6, 255, 3, 1, 'fieldName', '', 'Field`s name which used to store data in database and access field via scripts.', 33, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (11, 'Display Name', 1, 0, '2025-08-18 10:43:52', 0, 6, 255, 2, 1, 'name', '', '', 128, 0, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (12, 'Field description ', 1, 0, '2025-08-18 10:43:50', 0, 6, 5, 6, 1, 'description', '', '', 65000, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (13, 'Section id', 1, 0, '2025-08-18 10:43:48', 0, 4, 254, 1, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (14, 'Node name (table name)', 1, 0, '2025-08-18 10:43:46', 0, 4, 5, 160, 1, 'tableName', '', '', 24, 0, 1, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (17, 'Organization name', 1, 0, '2025-08-18 10:43:43', 0, 7, 255, 1, 1, 'name', '', '', 255, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (18, 'Member of', 1, 0, '2014-12-26 19:34:51', 0, 5, 5, 1042, 7, '_organizationId', '_organization', '', 7, 0, 0, 1, 1, 7, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (20, 'Field type', 1, 0, '2025-08-18 10:43:38', 0, 6, 7, 73, 6, 'fieldType', '', '', 0, 1, 0, 1, 1, 0, 0, 1, '', 0, 1, '', 0, '');
INSERT INTO "public"."_fields" VALUES (27, 'Is Required', 1, 0, '2025-08-18 10:43:01', 0, 6, 5, 137, 5, 'requirement', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (28, 'Is Unique value', 1, 0, '2025-08-18 10:43:03', 0, 6, 5, 143, 5, 'unique', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (29, 'For search', 1, 0, '2025-08-18 10:42:54', 0, 6, 5, 142, 5, 'forSearch', '', '', 0, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (31, 'Priority', 1, 0, '2025-08-18 10:42:52', 0, 6, 5, 5, 2, 'prior', '', '', 8, 1, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (32, 'Store in DB', 1, 0, '2025-08-18 10:42:49', 0, 6, 5, 139, 5, 'storeInDb', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'database', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (33, 'Priority', 1, 0, '2025-08-18 10:42:47', 0, 4, 7, 24, 2, 'prior', '', '', 8, 1, 0, 0, 1, 0, 0, 1, 'sort-numeric-asc', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (35, 'Captcha', 1, 0, '2025-08-18 10:42:45', 0, 4, 5, 284, 5, 'captcha', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'edit', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (36, 'Role name', 1, 0, '2025-08-18 10:42:43', 0, 8, 255, 23, 1, 'name', '', '', 45, 1, 1, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (38, 'E-mail', 1, 0, '2011-05-13 11:57:09', 0, 5, 19, 125, 1, 'email', '', '', 64, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (40, '', 1, 0, '2011-05-13 13:11:08', 0, 5, 0, 173, 8, 'descSpl', '', '<div id="noNeedLoginHere"></div> Fill information about your self:', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (49, 'Notify on Email about new private messages', 1, 0, '2014-12-30 14:49:56', 0, 5, 1, 339, 5, 'mailing', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (52, 'Parent document', 1, 0, '2025-08-18 10:42:38', 0, 9, 7, 56, 7, 'nodeFiltersLinker', '_nodes', '', 4, 1, 0, 1, 1, 4, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (53, 'Filter name', 1, 0, '2014-11-28 15:16:09', 0, 9, 255, 2, 1, 'name', '', '', 40, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (54, 'SQL condition', 1, 0, '2014-11-28 15:17:21', 0, 9, 7, 23, 1, 'filter', '', '', 1024, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (55, 'ViewName to select from', 1, 0, '2014-11-28 15:18:21', 0, 9, 7, 34, 1, 'view', '', '', 127, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (73, 'Draftable', 1, 0, '2014-12-10 12:45:25', 0, 4, 5, 1354, 5, 'draftable', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'pencil', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (138, 'Sort by', 1, 0, '2025-08-18 10:42:36', 0, 4, 5, 217, 7, '_fieldsId', '_fields', '', 6, 0, 0, 1, 1, 6, 0, 1, 'sort-alpha-asc', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (139, 'Activation code', 1, 0, '2025-08-18 10:42:34', 0, 5, 0, 876, 1, 'activation', '', '', 16, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (39, 'Confirm password', 1, 0, '2011-05-13 12:43:08', 0, 5, 1, 130, 10, 'passwordConfirm', '', '', 128, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (90, 'Select from DB name', 1, 0, '2014-12-26 14:15:12', 0, 6, 5, 150, 1, 'selectFieldName', '', '', 127, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (22, 'In Editable form', 1, 0, '2014-12-20 14:42:21', 0, 6, 5, 165, 5, 'visibilityCreate', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'edit', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (23, 'In List', 1, 0, '2025-08-18 10:43:33', 0, 6, 5, 167, 5, 'visibilityList', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'list', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (21, 'Visibility', 1, 0, '2025-08-18 10:43:35', 0, 6, 5, 163, 2, 'show', '', '', 15, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (24, 'In Read Only form', 1, 0, '2025-08-18 10:43:30', 0, 6, 5, 166, 5, 'visibilityView', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'search', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (191, 'URL', 1, 0, '2015-02-04 14:30:51', 0, 4, 5, 10341, 1, 'staticLink', '', '', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (196, 'First name', 1, 0, '2015-02-10 13:18:52', 0, 5, 0, 188, 1, 'firstName', '', '', 20, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (197, 'Last name', 1, 0, '2015-02-10 13:40:46', 0, 5, 0, 187, 1, 'lastName', '', '', 32, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (198, 'Mid name', 1, 0, '2015-02-10 13:41:46', 0, 5, 0, 189, 1, 'midName', '', '', 24, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (199, 'Company', 1, 0, '2015-02-10 13:42:37', 0, 5, 63, 123, 1, 'company', '', '', 127, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (200, 'Title', 1, 0, '2015-02-10 13:43:32', 0, 5, 5, 124, 1, 'title', '', '', 200, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (201, 'About', 1, 0, '2015-02-10 13:44:21', 0, 5, 5, 126, 1, 'description', '', '', 2048, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (202, 'Web site', 1, 0, '2015-02-10 13:45:16', 0, 5, 0, 316, 1, 'www', '', '', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (243, 'Document name', 1, 0, '2025-08-18 10:42:23', 0, 49, 255, 0, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (244, 'Body', 1, 0, '2015-11-11 09:13:52', 0, 49, 5, 91, 19, 'body', '', '', 8000999, 0, 0, 0, 1, 0, 1, 1, '', 999, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (218, 'Common information', 1, 0, '2015-02-25 13:24:25', 0, 5, 5, 1, 17, 'mainTab', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'user', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (221, 'Settings', 1, 0, '2015-02-25 13:43:35', 0, 5, 1, 131, 17, 'privilegesTab', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'cog', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (4, 'Parent section', 1, 0, '2025-08-18 10:44:03', 0, 4, 7, 23, 7, '_nodesId', '_nodes', 'parent node id', 4, 1, 0, 1, 1, 4, 0, 1, 'sitemap', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (6, 'Password', 1, 0, '2025-08-18 10:43:59', 0, 5, 1, 129, 10, 'password', '('''')', '', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (26, 'Max length', 1, 0, '2025-08-18 10:43:28', 0, 6, 7, 74, 2, 'maxLength', '', '', 8, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (10, 'Parent Section', 1, 0, '2025-08-18 10:43:54', 0, 6, 7, 115, 7, 'nodeFieldsLinker', '_nodes', 'parent node', 4, 1, 0, 1, 1, 4, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (59, 'Avatar', 1, 0, '2014-12-16 16:16:57', 0, 5, 63, 1, 12, 'avatar', '', '', 2000200, 0, 0, 0, 1, 0, 0, 1, '', 200, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (37, 'Description', 1, 0, '2011-05-10 16:15:46', 0, 8, 47, 64, 1, 'description', '', '', 3000, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (245, 'Link', 1, 0, '2015-11-11 09:34:51', 0, 49, 5, 21, 1, 'link', '', '', 0, 0, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (246, 'File name', 1, 0, '2015-11-11 10:17:47', 0, 49, 5, 32, 1, 'title', '', '', 127, 1, 1, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (252, 'Records per page', 1, 0, '2016-02-08 19:39:22', 0, 4, 5, 264, 2, 'recPerPage', '', '', 3, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (256, 'Icon', 1, 0, '2025-08-18 10:42:01', 0, 6, 5, 4, 1, 'icon', '', '', 24, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (287, 'Roles', 1, 1, '2016-03-14 13:31:44', 0, 5, 1, 127, 14, '_userRoles', '_roles', '', 0, 0, 0, 0, 1, 8, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (288, 'Role owners', 1, 1, '2016-03-14 13:31:44', 0, 8, 5, 87, 14, '_userRoles', '_users', '', 0, 0, 0, 0, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, '');
INSERT INTO "public"."_fields" VALUES (295, 'Creation name', 1, 1, '2016-03-21 07:15:14', 0, 4, 1, 202, 1, 'creationName', '', 'Name which will be used on creation page. Useful for some not English languages. You can keep this field empty.', 64, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (310, 'Name', 1, 0, '2016-03-28 07:20:08', 0, 52, 255, 1, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (311, 'Display name', 1, 0, '2016-03-28 07:46:54', 0, 53, 255, 10, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (312, 'Value', 1, 1, '2016-03-28 07:52:09', 0, 53, 47, 31, 2, 'value', '', '', 11, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (314, 'List', 1, 1, '2016-03-28 07:57:51', 0, 52, 5, 21, 15, 'values', '', '', 0, 0, 0, 0, 0, 53, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (315, 'Enumeration', 1, 1, '2016-03-28 07:57:52', 0, 53, 1, 1050, 7, 'valuesLinker', '_enums', '', 0, 0, 0, 1, 1, 52, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (316, 'Enumeration', 1, 1, '2016-03-28 08:26:41', 0, 6, 5, 115, 7, 'enum', '_enums', '', 0, 0, 0, 0, 1, 52, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (325, 'Multilingual field', 1, 1, '2016-04-19 14:05:25', 0, 6, 7, 143, 5, 'multilingual', '', '', 0, 0, 0, 1, 1, 0, 0, 1, 'language', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (326, 'Name', 1, 0, '2016-04-19 14:10:20', 0, 12, 255, 1, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (327, 'Lang code (en, ru, ...)', 1, 1, '2016-04-19 14:11:58', 0, 12, 7, 11, 1, 'code', '', '', 2, 0, 1, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (328, 'Multilingual enabled', 1, 1, '2016-04-22 13:31:08', 0, 5, 0, 247, 5, 'multilingualEnabled', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (345, '', 1, 1, '2016-05-04 08:02:22', 0, 4, 5, 10363, 15, 'nodeFields', '', '', 0, 0, 0, 0, 0, 6, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (352, 'Reverse sorting', 1, 1, '2016-05-16 07:41:01', 0, 4, 5, 218, 5, 'reverse', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'sort-alpha-desc', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (397, 'Icon', 1, 1, '2016-08-09 07:13:55', 0, 4, 5, 22, 1, 'icon', '', '', 24, 0, 0, 0, 1, 0, 0, 1, 'photo', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (251, 'Users', 1, 0, '2016-02-07 18:14:02', 0, 7, 5, 82, 14, '_organizationUsers', '_users', '', 5, 0, 0, 0, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, '');
INSERT INTO "public"."_fields" VALUES (318, 'In Drop-Down List', 1, 1, '2016-04-05 08:27:23', 0, 6, 5, 170, 5, 'visibilityDropdownList', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'list-alt', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (573, 'High priority query', 1, 1, '2017-03-28 08:47:55', 0, 9, 3, 22, 5, 'hiPriority', '', '', 1, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (651, 'Additional SELECT fields', 1, 1, '2017-07-03 05:10:13', 33, 9, 3, 24, 1, 'fields', '', '', 255, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (656, 'UI Language', 1, 1, '2018-01-04 23:02:24', 1, 5, 1, 132, 7, 'language', '_languages', '', 0, 0, 0, 1, 1, 12, 0, 1, '', 0, 0, 'langIcon', 0, '');
INSERT INTO "public"."_fields" VALUES (657, 'Icon', 1, 1, '2018-01-04 23:20:41', 1, 12, 63, 2, 12, 'langIcon', '', '', 600030, 0, 0, 0, 1, 0, 0, 1, '', 30, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (658, 'Width', 1, 1, '2018-01-12 21:54:03', 1, 6, 1, 144, 2, 'width', '', '', 5, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (659, 'Height', 1, 1, '2018-01-12 21:55:34', 1, 6, 5, 145, 2, 'height', '', '', 4, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (665, 'Name', 1, 0, '2021-07-02 15:26:32', 0, 83, 255, 0, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (666, 'Created on', 1, 0, '2021-07-02 15:26:32', 0, 83, 62, 1, 4, '_createdOn', '', '', 0, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (667, 'Organization', 1, 0, '2021-07-02 15:26:32', 0, 83, 6, 22, 7, '_organizationId', '_organization', '', 0, 0, 0, 1, 1, 7, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (668, 'Owner', 1, 0, '2021-07-02 15:26:32', 0, 83, 6, 23, 7, '_usersId', '_users', '', 0, 0, 0, 1, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, '');
INSERT INTO "public"."_fields" VALUES (669, 'File', 1, 1, '2021-07-02 15:28:04', 1, 83, 63, 11, 21, 'file', '', '', 0, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (728, 'order', 1, 1, '2021-07-20 17:27:45', 1, 53, 59, 41, 2, 'order', '', 'to have ordering in 1toN lookups, just add field ''order''  to target node.', 9, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (752, 'Filter id', 1, 0, '2025-08-18 10:41:51', 0, 9, 254, 1, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (753, 'Default filter', 1, 1, '2021-09-13 15:34:29', 1, 4, 5, 263, 7, 'defaultFilterId', '_filters', '', 0, 0, 0, 1, 1, 9, 0, 1, 'filter', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (754, 'Field id', 1, 0, '2025-08-18 10:41:49', 0, 6, 254, 1, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (755, 'Language id', 1, 0, '2019-01-18 10:37:40', 0, 12, 254, 0, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (800, 'Store forms in DB', 1, 1, '2021-09-17 21:10:57', 1, 4, 7, 149, 5, 'storeForms', '', '', 0, 0, 0, 1, 1, 0, 0, 1, 'database', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (801, 'Username', 1, 1, '2021-09-19 11:59:38', 1, 20, 255, 14, 1, 'username', '', '', 64, 1, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (802, 'Password', 1, 1, '2021-09-19 12:16:52', 1, 20, 63, 15, 10, 'password', '', '', 128, 1, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (803, ' ', 1, 1, '2021-09-22 14:14:05', 1, 49, 1, 31, 8, 'clickableLink', '', '<a class="clickable-link" target="_blank"><span class="clickable-link-text">link</span></a>', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (804, 'Username', 1, 1, '2021-09-22 15:49:00', 1, 21, 0, 11, 1, 'name', '', '', 64, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (805, 'Password', 1, 1, '2021-09-22 15:49:38', 1, 21, 1, 22, 10, 'password', '', '', 128, 1, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (807, 'Email', 1, 1, '2021-09-22 16:41:21', 1, 21, 63, 21, 1, 'email', '', '', 64, 1, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (808, 'salt', 1, 1, '2021-09-22 17:43:09', 1, 21, 0, 101, 1, 'salt', '', '', 32, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (809, 'activationKey', 1, 1, '2021-09-22 17:44:03', 1, 21, 0, 81, 1, 'activationKey', '', '', 48, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (813, 'Email', 1, 1, '2021-09-23 16:16:58', 1, 22, 1, 35, 1, 'email', '', '', 64, 1, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (814, 'salt', 1, 1, '2021-09-22 17:43:09', 1, 5, 0, 101, 1, 'salt', '', '', 32, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (815, 'Node type', 1, 1, '2021-09-27 16:26:21', 1, 4, 63, 109, 6, 'nodeType', '', '', 0, 1, 0, 1, 1, 0, 0, 1, '', 0, 2, '', 0, '');
INSERT INTO "public"."_fields" VALUES (343, 'Properties', 1, 1, '2016-05-04 07:59:18', 0, 4, 5, 10352, 17, 'propertyTab', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'cog', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (660, 'Common', 1, 1, '2016-03-14 09:11:03', 0, 7, 5, 0, 17, 'commonTab', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'tags', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (253, 'Related Section', 1, 0, '2015-03-16 12:36:21', 0, 6, 5, 94, 7, 'nodeRef', '_nodes', 'node lookup field points to', 0, 0, 0, 1, 1, 4, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (820, 'Enumeration id', 1, 0, '2025-08-18 10:41:40', 0, 52, 2, 0, 2, 'id', '', '', 15, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (823, 'Display', 1, 1, '2021-09-28 18:06:12', 1, 6, 1, 16, 6, 'display', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 3, '', 1, '');
INSERT INTO "public"."_fields" VALUES (824, '', 1, 1, '2016-05-04 08:02:22', 0, 4, 5, 10368, 15, 'nodeFilters', '', '', 0, 0, 0, 0, 0, 9, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (826, 'Additional CSS class', 1, 1, '2021-10-21 09:54:50', 1, 6, 5, 26, 1, 'cssClass', '', 'Separate multiply classes with space', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (827, 'Additional CSS class', 1, 1, '2021-10-21 10:22:29', 1, 4, 5, 1364, 1, 'cssClass', '', 'Separate multiply classes with space', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (806, 'Repeat password', 1, 1, '2021-09-22 15:50:30', 1, 21, 1, 51, 10, 'passwordConfirm', '', '', 128, 1, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (811, 'Already have an account?', 1, 1, '2021-09-23 15:35:07', 1, 21, 1, 61, 18, 'alreadyHaveAccountBtn', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, 'link-button-field');
INSERT INTO "public"."_fields" VALUES (819, 'Appearance settings', 1, 1, '2021-09-28 13:42:55', 1, 4, 1, 161, 22, 'appearanceGroup', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (822, 'Field visibility', 1, 1, '2021-09-28 15:29:10', 1, 6, 1, 152, 22, 'visibilitySplitter', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'eye', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (821, 'Data storage settings', 1, 1, '2021-09-28 15:27:47', 1, 6, 1, 73, 22, 'storageSettingSplitter', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'database', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (818, 'Data storage settings', 1, 1, '2021-09-28 13:42:06', 1, 4, 1, 119, 22, 'dataStorageGroup', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'database', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (816, 'Lookup icon select name', 1, 1, '2021-09-28 11:54:22', 1, 6, 1, 151, 1, 'lookupIcon', '', '', 33, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (810, 'Forgot my password', 1, 1, '2021-09-23 15:31:06', 1, 20, 63, 27, 18, 'forgotPasswordButton', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 1, 'link-button-field');
INSERT INTO "public"."_fields" VALUES (828, 'I change my mind', 1, 1, '2021-10-22 13:46:41', 1, 22, 1, 45, 18, 'backToLogin', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 1, 'link-button-field');
INSERT INTO "public"."_fields" VALUES (812, 'Sign up', 1, 1, '2021-09-23 15:46:53', 1, 20, 1, 28, 18, 'signUpLinkBtn', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 1, 'link-button-field');
INSERT INTO "public"."_fields" VALUES (832, 'Roles', 1, 1, '2021-11-05 14:18:07', 1, 9, 5, 86, 14, '_filterAccessRoles', '_roles', '', 0, 0, 0, 1, 1, 8, 0, 1, 'user', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (833, 'Order', 1, 1, '2021-11-05 14:43:01', 1, 9, 5, 66, 2, 'order', '', '', 7, 0, 0, 1, 1, 0, 0, 1, 'sort-numeric-asc', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (831, 'In Sub-Form List', 1, 1, '2021-10-29 11:49:54', 1, 6, 7, 179, 5, 'visibilitySubFormList', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'list-ul', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (829, 'Or sign with:', 1, 1, '2021-10-23 11:54:27', 1, 20, 1, 26, 8, 'socialLoginButtons', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '0', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (830, 'Sign In', 1, 1, '2021-10-26 15:23:00', 1, 20, 1, 25, 18, 'signInBtn', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'sign-in', 0, 0, '', 0, 'sign-in-button');
INSERT INTO "public"."_fields" VALUES (861, 'Name', 1, 0, '2025-08-24 16:08:02.26454', 1, 121, 65535, 0, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (357, 'In Custom-View List', 1, 0, '2025-08-18 10:42:05', 0, 6, 5, 168, 5, 'visibilityCustomList', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'th', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (344, 'Fields', 1, 1, '2016-05-04 08:00:39', 0, 4, 5, 10362, 17, 'fieldsTab', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'list', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (825, 'Filters', 1, 1, '2016-05-04 08:00:39', 0, 4, 5, 10366, 17, 'filtersTab', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'list', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (222, 'Change Password', 1, 0, '2015-02-25 13:46:11', 0, 5, 1, 128, 17, 'passwordTab', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'key', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (664, 'Members', 1, 1, '2018-01-13 16:54:01', 1, 7, 5, 2, 17, 'membersTab', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'users', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (751, 'Is UI language', 1, 1, '2021-09-13 14:10:19', 1, 12, 7, 21, 5, 'isUILanguage', '', 'Used to load localization data for user UI. locales/xx/lang.ts', 2, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (486, 'Send to server', 1, 1, '2016-10-28 09:12:28', 0, 6, 1, 138, 5, 'sendToServer', '', 'If 0 - data of this field will not be sent to server and uses only for client side operating.', 0, 0, 0, 1, 1, 0, 0, 1, 'upload', 0, 0, '', 1, '');
INSERT INTO "public"."_fields" VALUES (862, 'Created on', 1, 0, '2025-08-24 16:08:02.265224', 1, 121, 6, 270, 4, '_createdOn', '', '', 0, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (863, 'Organization', 1, 0, '2025-08-24 16:08:02.266147', 1, 121, 6, 280, 7, '_organizationId', '_organization', '', 0, 0, 0, 1, 1, 7, 0, 1, '', 0, 0, '', 0, '');
INSERT INTO "public"."_fields" VALUES (864, 'Owner', 1, 0, '2025-08-24 16:08:02.266578', 1, 121, 6, 290, 7, '_usersId', '_users', '', 0, 0, 0, 1, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, '');
INSERT INTO "public"."_fields" VALUES (867, 'datetime', 1, 1, '2025-09-05 17:34:39.460409', 1, 121, 39, 1, 4, 'dttm', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, '');

-- ----------------------------
-- Table structure for _files
-- ----------------------------
DROP TABLE IF EXISTS "public"."_files";
CREATE TABLE "public"."_files" (
  "id" int4 NOT NULL DEFAULT nextval('_filesidseq'::regclass),
  "status" int2 NOT NULL,
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "file" varchar(127) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of _files
-- ----------------------------

-- ----------------------------
-- Table structure for _filterAccessRoles
-- ----------------------------
DROP TABLE IF EXISTS "public"."_filterAccessRoles";
CREATE TABLE "public"."_filterAccessRoles" (
  "_filtersId" int4 NOT NULL,
  "_rolesId" int4 NOT NULL,
  "id" int8 NOT NULL DEFAULT nextval('_filteraccessrolesidseq'::regclass)
)
;

-- ----------------------------
-- Records of _filterAccessRoles
-- ----------------------------

-- ----------------------------
-- Table structure for _filters
-- ----------------------------
DROP TABLE IF EXISTS "public"."_filters";
CREATE TABLE "public"."_filters" (
  "id" int4 NOT NULL DEFAULT nextval('_filtersidseq'::regclass),
  "status" int2 NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "nodeFiltersLinker" int4 NOT NULL,
  "name" varchar(40) COLLATE "pg_catalog"."default" NOT NULL,
  "filter" text COLLATE "pg_catalog"."default" NOT NULL,
  "view" varchar(127) COLLATE "pg_catalog"."default" NOT NULL,
  "hiPriority" int2 NOT NULL,
  "fields" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "order" int4 NOT NULL
)
;

-- ----------------------------
-- Records of _filters
-- ----------------------------
INSERT INTO "public"."_filters" VALUES (8, 1, 1, '2021-09-13 15:08:39', 1, 4, 'Can have filter', '(_nodes."nodeType" = 2 AND _nodes."storeForms" = 1)', '', 0, '', 0);

-- ----------------------------
-- Table structure for _html
-- ----------------------------
DROP TABLE IF EXISTS "public"."_html";
CREATE TABLE "public"."_html" (
  "id" int4 NOT NULL DEFAULT nextval('_htmlidseq'::regclass),
  "status" int2 NOT NULL,
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "body" text COLLATE "pg_catalog"."default" NOT NULL,
  "title" varchar(127) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of _html
-- ----------------------------

-- ----------------------------
-- Table structure for _languages
-- ----------------------------
DROP TABLE IF EXISTS "public"."_languages";
CREATE TABLE "public"."_languages" (
  "id" int4 NOT NULL DEFAULT nextval('_languagesidseq'::regclass),
  "status" int2 NOT NULL,
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "code" varchar(2) COLLATE "pg_catalog"."default" NOT NULL,
  "langIcon" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "isUILanguage" int2 NOT NULL
)
;

-- ----------------------------
-- Records of _languages
-- ----------------------------
INSERT INTO "public"."_languages" VALUES (1, 1, 'English', 1, '2016-04-19 14:12:10', 0, '', '57/5592b6e226551.jpg', 1);

-- ----------------------------
-- Table structure for _nodes
-- ----------------------------
DROP TABLE IF EXISTS "public"."_nodes";
CREATE TABLE "public"."_nodes" (
  "id" int4 NOT NULL DEFAULT nextval('_nodesidseq'::regclass),
  "nodeType" int4 NOT NULL,
  "_nodesId" int4 NOT NULL,
  "status" int2 NOT NULL,
  "tableName" varchar(24) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "singleName" varchar(127) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "name" varchar(127) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::text,
  "prior" int4 NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "captcha" int2 NOT NULL DEFAULT 0,
  "_organizationId" int4 NOT NULL,
  "draftable" int2 NOT NULL DEFAULT 0,
  "_fieldsId" int4 NOT NULL DEFAULT 0,
  "staticLink" varchar(128) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "recPerPage" int4 NOT NULL,
  "icon" varchar(24) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "creationName" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "reverse" int2 NOT NULL DEFAULT 0,
  "defaultFilterId" int4 NOT NULL DEFAULT 0,
  "storeForms" int2 NOT NULL,
  "cssClass" varchar(128) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying
)
;
COMMENT ON COLUMN "public"."_nodes"."status" IS '1-public; 2-template; 0-deleted';

-- ----------------------------
-- Records of _nodes
-- ----------------------------
INSERT INTO "public"."_nodes" VALUES (2, 1, 0, 1, '', 'Root', 'Root', '', 12, 0, '2000-06-18 10:38:54', 0, 0, 0, 0, '', 10, '', '', 0, 0, 0, '');
INSERT INTO "public"."_nodes" VALUES (6, 2, 10, 1, '_fields', 'Field', 'Fields', '', 11, 0, '1999-01-12 10:38:32', 0, 0, 1, 10, '', 20, 'edit', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (9, 2, 10, 1, '_filters', 'Filter', 'Filters', '', 55, 0, '2014-12-03 04:05:15', 0, 0, 1, 752, '', 40, 'filter', '', 1, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (10, 1, 2, 1, '', 'Deep Administration', 'Deep Administration', 'Danger zone. Please make changes here only if you know what you doing.', 1373, 0, '2014-12-23 18:44:46', 0, 0, 0, 0, '', 10, 'wrench', '', 0, 0, 0, '');
INSERT INTO "public"."_nodes" VALUES (12, 2, 10, 1, '_languages', 'Language', 'Languages', '', 995, 1, '2016-04-19 14:10:20', 0, 0, 0, 0, '', 25, 'flag', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (20, 2, 50, 1, '_login', ' Sign-in', ' Sign-in', '', 1, 1, '2021-09-19 11:48:43', 1, 1, 0, 0, '', 25, 'sign-in', '', 0, 0, 0, 'login-form');
INSERT INTO "public"."_nodes" VALUES (22, 2, 50, 1, '_resetPassword', 'Reset password', 'Reset password', '', 12, 1, '2021-09-23 16:16:23', 1, 1, 0, 0, '', 25, '', '', 0, 0, 0, 'login-form');
INSERT INTO "public"."_nodes" VALUES (50, 1, 0, 1, '', 'Hidden section', 'Hidden sections', '', 0, 0, '2015-12-24 12:16:16', 0, 0, 0, 0, '', 10, '', '', 0, 0, 0, '');
INSERT INTO "public"."_nodes" VALUES (53, 2, 50, 1, '_enumValues', 'Enumeration value', 'Enumeration values', '', 994, 1, '2016-03-28 07:46:54', 0, 0, 0, 312, '', 25, '', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (5, 2, 3, 1, '_users', 'User', 'Users', '', 30, 0, '2014-12-03 04:04:55', 0, 0, 0, 0, '', 50, 'user', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (8, 2, 3, 1, '_roles', 'Role', 'Roles', '', 40, 0, '2011-05-05 14:36:20', 0, 0, 0, 0, '', 10, 'id-badge', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (7, 2, 3, 1, '_organization', 'Organization', 'Organizations', '', 50, 0, '2000-01-18 10:38:17', 0, 0, 0, 0, '', 10, 'institution', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (52, 2, 3, 1, '_enums', 'Enumeration', 'Enumerations', '', 80, 1, '2016-03-28 07:20:08', 0, 0, 0, 0, '', 25, 'list', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (49, 2, 3, 1, '_html', 'Page', 'Pages', '', 70, 0, '2015-11-11 09:11:54', 0, 0, 0, 193, '', 10, 'file-o', '', 0, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (123, 2, 3, 1, 'myRecordsNoTable', '', 'Records with no table', '', 10, 1, '2025-08-25 10:12:38.36154', 0, 1, 0, 0, '', 25, 'power-off', '', 0, 0, 0, '');
INSERT INTO "public"."_nodes" VALUES (21, 2, 50, 1, '_registration', 'Create a New Account', 'Create a New Account', '', 22, 1, '2021-09-22 16:13:47', 1, 1, 0, 0, '', 25, 'check', '', 0, 0, 1, 'login-form');
INSERT INTO "public"."_nodes" VALUES (3, 1, 2, 1, '', 'Administration', 'Administration', '', 480, 0, '2014-12-03 04:04:55', 0, 0, 0, 0, '', 10, 'gear', '', 0, 0, 0, '');
INSERT INTO "public"."_nodes" VALUES (4, 2, 10, 1, '_nodes', 'Section', 'Sections', 'Website''s section', 9, 0, '2014-12-19 12:18:48', 0, 0, 1, 13, '', 25, 'sitemap', 'Add new section', 1, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (121, 2, 3, 1, 'myRecords', 'My Record', 'My Records', '', 20, 1, '2025-08-24 16:08:02.257703', 0, 1, 0, 862, '', 25, 'music', '', 1, 0, 1, '');
INSERT INTO "public"."_nodes" VALUES (1, 4, 50, 1, 'AdminRolePrivilegesForm', 'Right access form', 'Right access form', '', 994, 1, '2016-03-15 08:17:01', 0, 0, 0, 0, '', 25, '', '', 0, 0, 0, '');
INSERT INTO "public"."_nodes" VALUES (83, 2, 3, 1, '_files', 'File', 'Files', '', 60, 1, '2021-07-02 18:26:32', 0, 1, 0, 0, '', 25, 'file', '', 0, 0, 1, '');

-- ----------------------------
-- Table structure for _organization
-- ----------------------------
DROP TABLE IF EXISTS "public"."_organization";
CREATE TABLE "public"."_organization" (
  "id" int4 NOT NULL DEFAULT nextval('_organizationidseq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "status" int2 NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL
)
;

-- ----------------------------
-- Records of _organization
-- ----------------------------
INSERT INTO "public"."_organization" VALUES (1, 'admin group', 1, 0, '2025-08-18 10:39:45', 1);
INSERT INTO "public"."_organization" VALUES (2, 'guest group', 1, 0, '2025-08-18 10:39:53', 2);
INSERT INTO "public"."_organization" VALUES (3, 'user group', 1, 0, '2025-08-18 10:39:59', 3);
INSERT INTO "public"."_organization" VALUES (8, '123123123', 0, 1, '2025-08-24 10:46:59.233879', 1);

-- ----------------------------
-- Table structure for _organizationUsers
-- ----------------------------
DROP TABLE IF EXISTS "public"."_organizationUsers";
CREATE TABLE "public"."_organizationUsers" (
  "_organizationId" int4 NOT NULL,
  "_usersId" int4 NOT NULL,
  "id" int8 NOT NULL DEFAULT nextval('_organizationusersidseq'::regclass)
)
;

-- ----------------------------
-- Records of _organizationUsers
-- ----------------------------

-- ----------------------------
-- Table structure for _registration
-- ----------------------------
DROP TABLE IF EXISTS "public"."_registration";
CREATE TABLE "public"."_registration" (
  "id" int4 NOT NULL DEFAULT nextval('_registrationidseq'::regclass),
  "status" int2 NOT NULL,
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "password" text COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "salt" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "activationKey" varchar(48) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of _registration
-- ----------------------------

-- ----------------------------
-- Table structure for _rolePrivileges
-- ----------------------------
DROP TABLE IF EXISTS "public"."_rolePrivileges";
CREATE TABLE "public"."_rolePrivileges" (
  "nodeId" int4 NOT NULL,
  "roleId" int4 NOT NULL,
  "privileges" int4 NOT NULL
)
;

-- ----------------------------
-- Records of _rolePrivileges
-- ----------------------------
INSERT INTO "public"."_rolePrivileges" VALUES (0, 1, 65535);
INSERT INTO "public"."_rolePrivileges" VALUES (2, 2, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (12, 2, 7);
INSERT INTO "public"."_rolePrivileges" VALUES (20, 2, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (21, 2, 12);
INSERT INTO "public"."_rolePrivileges" VALUES (22, 2, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (49, 2, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (81, 2, 8);
INSERT INTO "public"."_rolePrivileges" VALUES (83, 2, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (2, 3, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (5, 3, 17);
INSERT INTO "public"."_rolePrivileges" VALUES (11, 3, 1);
INSERT INTO "public"."_rolePrivileges" VALUES (12, 3, 7);
INSERT INTO "public"."_rolePrivileges" VALUES (22, 3, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (49, 3, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (81, 3, 8);
INSERT INTO "public"."_rolePrivileges" VALUES (83, 3, 4);
INSERT INTO "public"."_rolePrivileges" VALUES (0, 7, 7);

-- ----------------------------
-- Table structure for _roles
-- ----------------------------
DROP TABLE IF EXISTS "public"."_roles";
CREATE TABLE "public"."_roles" (
  "id" int4 NOT NULL DEFAULT nextval('_rolesidseq'::regclass),
  "name" varchar(45) COLLATE "pg_catalog"."default" NOT NULL,
  "status" int2 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_usersId" int4 NOT NULL,
  "description" text COLLATE "pg_catalog"."default" NOT NULL,
  "_organizationId" int4 NOT NULL
)
;

-- ----------------------------
-- Records of _roles
-- ----------------------------
INSERT INTO "public"."_roles" VALUES (1, 'Super admin', 1, '2025-08-07 10:40:13', 1, 'Full access for all sections', 0);
INSERT INTO "public"."_roles" VALUES (2, 'Guest', 1, '2014-12-15 13:07:32', 1, 'Role assigned to each unauthorized user', 0);
INSERT INTO "public"."_roles" VALUES (3, 'User', 1, '2014-12-12 18:39:47', 1, 'Role assigned to each authorized user', 0);
INSERT INTO "public"."_roles" VALUES (7, 'View all', 1, '2016-03-07 03:00:00', 1, 'Read only access to all sections', 0);

-- ----------------------------
-- Table structure for _userRoles
-- ----------------------------
DROP TABLE IF EXISTS "public"."_userRoles";
CREATE TABLE "public"."_userRoles" (
  "_usersId" int4 NOT NULL,
  "_rolesId" int4 NOT NULL,
  "id" int8 NOT NULL DEFAULT nextval('_userrolesidseq'::regclass)
)
;

-- ----------------------------
-- Records of _userRoles
-- ----------------------------
INSERT INTO "public"."_userRoles" VALUES (1, 1, 1);

-- ----------------------------
-- Table structure for _users
-- ----------------------------
DROP TABLE IF EXISTS "public"."_users";
CREATE TABLE "public"."_users" (
  "id" int4 NOT NULL DEFAULT nextval('_usersidseq'::regclass),
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "_organizationId" int4 NOT NULL,
  "password" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
  "salt" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "status" int2 NOT NULL,
  "blockedTo" timestamp(6) NOT NULL,
  "mistakes" int4 NOT NULL,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "email" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "mailing" int2 NOT NULL,
  "avatar" varchar(130) COLLATE "pg_catalog"."default" NOT NULL,
  "resetCode" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "resetTime" timestamp(6) NOT NULL,
  "firstName" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "lastName" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "midName" varchar(24) COLLATE "pg_catalog"."default" NOT NULL,
  "company" varchar(127) COLLATE "pg_catalog"."default" NOT NULL,
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default" NOT NULL,
  "multilingualEnabled" int2 NOT NULL,
  "defaultOrg" int4 NOT NULL,
  "language" int4 NOT NULL
)
;

-- ----------------------------
-- Records of _users
-- ----------------------------
INSERT INTO "public"."_users" VALUES (2, 'guest', 2, 'ncL4DFn76ds5yhg', '', 1, '2001-01-09 03:00:00', 3, 1, '2014-12-07 12:43:13', '', 0, '', '', '2021-10-06 13:22:23', '', '', '', 'guest group', 'guest', '', 0, 2, 0);
INSERT INTO "public"."_users" VALUES (18, 'myuser', 4, '123', '123', 0, '2025-08-05 11:17:57', 2, 4, '2025-08-24 11:20:12.91936', '123@123.123', 1, '123/123.jpg', '123123', '2025-08-21 11:18:44', '123', '123', '123', '123', '123', '123', 0, 3, 0);
INSERT INTO "public"."_users" VALUES (1, 'admin', 1, 'a1c16809be394ccce59d228609d8db9b209cbd8636ba3925b00025ac862e57c9cc0789a937db9839f0b294f93467d5671f70750ae85f713fbcaa6a61c0dcbeef', 'a803e7567d6214fd199a10dc8ea4d5b2', 1, '2014-11-01 23:35:57', 2, 1, '2014-12-30 14:54:50', 'admin', 1, '5e/5310a64b44433.png', '', '2025-09-07 12:12:36.148195', '', '', '', 'admin group', '', '123', 0, 1, 0);
INSERT INTO "public"."_users" VALUES (3, 'user', 3, 'ncL4DFn76ds5yhg', '', 1, '2001-01-19 03:00:00', 2, 1, '2014-12-10 13:09:02', '', 1, '2e/44dafabea257a.jpg', '', '2021-07-30 00:00:00', '', '', '', 'user group', '', '', 0, 3, 0);

-- ----------------------------
-- Table structure for myRecords
-- ----------------------------
DROP TABLE IF EXISTS "public"."myRecords";
CREATE TABLE "public"."myRecords" (
  "id" int4 NOT NULL DEFAULT nextval('myrecordsidseq'::regclass),
  "status" int2 NOT NULL DEFAULT 0,
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "_usersId" int4 NOT NULL,
  "_createdOn" timestamp(6) NOT NULL DEFAULT now(),
  "_organizationId" int4 NOT NULL,
  "dttm" timestamp(6) NOT NULL DEFAULT '0385-07-25 08:56:56'::timestamp without time zone
)
;

-- ----------------------------
-- Records of myRecords
-- ----------------------------
INSERT INTO "public"."myRecords" VALUES (1, 0, 'rtrtrthtrhrthr', 1, '2025-08-24 17:58:12.871604', 1, '0385-07-25 08:56:56');
INSERT INTO "public"."myRecords" VALUES (2, 1, 'My Record 1', 1, '2025-09-01 21:43:40.008248', 1, '2025-06-08 09:09:00');

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_enumsidseq"
OWNED BY "public"."_enums"."id";
SELECT setval('"public"."_enumsidseq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_enumvaluesidseq"
OWNED BY "public"."_enumValues"."id";
SELECT setval('"public"."_enumvaluesidseq"', 51, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_fieldsidseq"
OWNED BY "public"."_fields"."id";
SELECT setval('"public"."_fieldsidseq"', 867, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_filesidseq"
OWNED BY "public"."_files"."id";
SELECT setval('"public"."_filesidseq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_filteraccessrolesidseq"
OWNED BY "public"."_filterAccessRoles"."id";
SELECT setval('"public"."_filteraccessrolesidseq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_filtersidseq"
OWNED BY "public"."_filters"."id";
SELECT setval('"public"."_filtersidseq"', 10, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_htmlidseq"
OWNED BY "public"."_html"."id";
SELECT setval('"public"."_htmlidseq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_languagesidseq"
OWNED BY "public"."_languages"."id";
SELECT setval('"public"."_languagesidseq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_nodesidseq"
OWNED BY "public"."_nodes"."id";
SELECT setval('"public"."_nodesidseq"', 123, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_organizationidseq"
OWNED BY "public"."_organization"."id";
SELECT setval('"public"."_organizationidseq"', 12, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_organizationusersidseq"
OWNED BY "public"."_organizationUsers"."id";
SELECT setval('"public"."_organizationusersidseq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_registrationidseq"
OWNED BY "public"."_registration"."id";
SELECT setval('"public"."_registrationidseq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_rolesidseq"
OWNED BY "public"."_roles"."id";
SELECT setval('"public"."_rolesidseq"', 16, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_userrolesidseq"
OWNED BY "public"."_userRoles"."id";
SELECT setval('"public"."_userrolesidseq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_usersidseq"
OWNED BY "public"."_users"."id";
SELECT setval('"public"."_usersidseq"', 18, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."myrecordsidseq"
OWNED BY "public"."myRecords"."id";
SELECT setval('"public"."myrecordsidseq"', 2, true);

-- ----------------------------
-- Indexes structure for table _enumValues
-- ----------------------------
CREATE INDEX "_createdOn" ON "public"."_enumValues" USING btree (
  "_createdOn" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "_organizationId" ON "public"."_enumValues" USING btree (
  "_organizationId" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_usersId" ON "public"."_enumValues" USING btree (
  "_usersId" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "order" ON "public"."_enumValues" USING btree (
  "order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "value" ON "public"."_enumValues" USING btree (
  "value" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "valuesLinker" ON "public"."_enumValues" USING btree (
  "valuesLinker" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _enumValues
-- ----------------------------
ALTER TABLE "public"."_enumValues" ADD CONSTRAINT "_enumValuesPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _enums
-- ----------------------------
CREATE INDEX "_enumsCreatedOn" ON "public"."_enums" USING btree (
  "_createdOn" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "_enumsOrganizationId" ON "public"."_enums" USING hash (
  "_organizationId" "pg_catalog"."int4_ops"
);
CREATE INDEX "_enumsUsersId" ON "public"."_enums" USING hash (
  "_usersId" "pg_catalog"."int4_ops"
);

-- ----------------------------
-- Primary Key structure for table _enums
-- ----------------------------
ALTER TABLE "public"."_enums" ADD CONSTRAINT "_enumsPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _fields
-- ----------------------------
ALTER TABLE "public"."_fields" ADD CONSTRAINT "_fieldsPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _files
-- ----------------------------
ALTER TABLE "public"."_files" ADD CONSTRAINT "_filesPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _filterAccessRoles
-- ----------------------------
CREATE INDEX "_filterAccessRolesFiltersId" ON "public"."_filterAccessRoles" USING hash (
  "_filtersId" "pg_catalog"."int4_ops"
);
CREATE INDEX "_filterAccessRolesRolesId" ON "public"."_filterAccessRoles" USING hash (
  "_rolesId" "pg_catalog"."int4_ops"
);

-- ----------------------------
-- Primary Key structure for table _filterAccessRoles
-- ----------------------------
ALTER TABLE "public"."_filterAccessRoles" ADD CONSTRAINT "_filterAccessRolesPkey" PRIMARY KEY ("_filtersId", "_rolesId");

-- ----------------------------
-- Primary Key structure for table _filters
-- ----------------------------
ALTER TABLE "public"."_filters" ADD CONSTRAINT "_filtersPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _html
-- ----------------------------
ALTER TABLE "public"."_html" ADD CONSTRAINT "_htmlPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _languages
-- ----------------------------
ALTER TABLE "public"."_languages" ADD CONSTRAINT "_languagesPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _nodes
-- ----------------------------
ALTER TABLE "public"."_nodes" ADD CONSTRAINT "_nodesPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _organization
-- ----------------------------
ALTER TABLE "public"."_organization" ADD CONSTRAINT "_organizationPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _organizationUsers
-- ----------------------------
CREATE INDEX "_organizationUsersOrganizationId" ON "public"."_organizationUsers" USING hash (
  "_organizationId" "pg_catalog"."int4_ops"
);
CREATE INDEX "_organizationUsersUsersId" ON "public"."_organizationUsers" USING hash (
  "_usersId" "pg_catalog"."int4_ops"
);

-- ----------------------------
-- Primary Key structure for table _organizationUsers
-- ----------------------------
ALTER TABLE "public"."_organizationUsers" ADD CONSTRAINT "_organizationUsersPkey" PRIMARY KEY ("_organizationId", "_usersId");

-- ----------------------------
-- Primary Key structure for table _registration
-- ----------------------------
ALTER TABLE "public"."_registration" ADD CONSTRAINT "_registrationPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _rolePrivileges
-- ----------------------------
ALTER TABLE "public"."_rolePrivileges" ADD CONSTRAINT "_rolePrivilegesPkey" PRIMARY KEY ("roleId", "nodeId");

-- ----------------------------
-- Primary Key structure for table _roles
-- ----------------------------
ALTER TABLE "public"."_roles" ADD CONSTRAINT "_rolesPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _userRoles
-- ----------------------------
CREATE INDEX "_userRoles_rolesIdIdx" ON "public"."_userRoles" USING hash (
  "_rolesId" "pg_catalog"."int4_ops"
);
CREATE INDEX "_userRoles_usersIdIdx" ON "public"."_userRoles" USING hash (
  "_usersId" "pg_catalog"."int4_ops"
);

-- ----------------------------
-- Primary Key structure for table _userRoles
-- ----------------------------
ALTER TABLE "public"."_userRoles" ADD CONSTRAINT "_userRolesPkey" PRIMARY KEY ("_usersId", "_rolesId");

-- ----------------------------
-- Primary Key structure for table _users
-- ----------------------------
ALTER TABLE "public"."_users" ADD CONSTRAINT "_usersPkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table myRecords
-- ----------------------------
CREATE INDEX "myRecordsCreatedOn" ON "public"."myRecords" USING btree (
  "_createdOn" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "myRecordsOrganizationId" ON "public"."myRecords" USING hash (
  "_organizationId" "pg_catalog"."int4_ops"
);
CREATE INDEX "myRecordsUsersId" ON "public"."myRecords" USING hash (
  "_usersId" "pg_catalog"."int4_ops"
);

-- ----------------------------
-- Primary Key structure for table myRecords
-- ----------------------------
ALTER TABLE "public"."myRecords" ADD CONSTRAINT "myRecordsKey" PRIMARY KEY ("id");
