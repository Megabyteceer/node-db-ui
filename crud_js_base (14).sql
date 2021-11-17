-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 17, 2021 at 11:17 AM
-- Server version: 10.3.30-MariaDB
-- PHP Version: 7.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crud_js_base`
--
CREATE DATABASE IF NOT EXISTS `crud_js_base` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `crud_js_base`;

-- --------------------------------------------------------

--
-- Table structure for table `docs`
--

DROP TABLE IF EXISTS `docs`;
CREATE TABLE `docs` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 1,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `docs`
--

INSERT INTO `docs` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`) VALUES
(0, 0, '', 0, '2021-09-28 11:04:51', 0);

-- --------------------------------------------------------

--
-- Table structure for table `_enums`
--

DROP TABLE IF EXISTS `_enums`;
CREATE TABLE `_enums` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 1,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_enums`
--

INSERT INTO `_enums` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`) VALUES
(0, 0, '', 0, '2017-08-18 11:02:25', 0),
(1, 1, 'Filed\'s type', 1, '2016-03-28 04:20:37', 0),
(2, 1, 'Node Type', 1, '2021-09-27 13:19:41', 1),
(3, 1, 'Field Display', 1, '2021-09-28 15:05:25', 1);

-- --------------------------------------------------------

--
-- Table structure for table `_enum_values`
--

DROP TABLE IF EXISTS `_enum_values`;
CREATE TABLE `_enum_values` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 1,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `value` bigint(11) NOT NULL DEFAULT 0,
  `values_linker` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `order` int(9) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_enum_values`
--

INSERT INTO `_enum_values` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`, `value`, `values_linker`, `order`) VALUES
(0, 0, '', 0, '2017-08-18 11:02:37', 0, 0, 0, 0),
(1, 1, 'Text', 1, '2016-03-28 05:05:09', 0, 1, 1, 0),
(2, 1, 'Number', 1, '2016-03-28 05:05:09', 0, 2, 1, 1),
(3, 1, 'DateTime', 1, '2016-03-28 05:05:09', 0, 4, 1, 4),
(4, 1, 'Bool', 1, '2016-03-28 05:05:09', 0, 5, 1, 2),
(5, 1, 'Enum', 1, '2016-03-28 05:05:09', 0, 6, 1, 5),
(6, 1, 'Lookup', 1, '2016-03-28 05:05:09', 0, 7, 1, 16),
(7, 1, 'Static HTML block', 1, '2016-03-28 05:05:09', 0, 8, 1, 14),
(9, 1, 'Password', 1, '2016-03-28 05:05:09', 0, 10, 1, 6),
(10, 1, 'Date', 1, '2016-03-28 05:05:09', 0, 11, 1, 3),
(11, 1, 'Image', 1, '2016-03-28 05:05:09', 0, 12, 1, 7),
(13, 1, 'Lookup N to M', 1, '2016-03-28 05:05:10', 0, 14, 1, 18),
(14, 1, 'Button', 1, '2016-03-28 05:07:02', 0, 18, 1, 10),
(15, 1, 'Rate', 1, '2016-03-28 05:07:02', 0, 16, 1, 9),
(16, 1, 'Tab', 1, '2016-03-28 05:07:02', 0, 17, 1, 11),
(17, 1, 'HTML editor', 1, '2016-03-28 05:07:02', 0, 19, 1, 12),
(18, 1, 'Lookup 1 to N', 1, '2016-03-28 05:07:02', 0, 15, 1, 17),
(30, 1, 'Color', 1, '2016-10-13 07:56:29', 0, 20, 1, 13),
(43, 1, 'File', 1, '2016-10-13 07:56:29', 0, 21, 1, 8),
(44, 1, 'Section', 1, '2021-09-27 13:24:25', 1, 1, 2, 0),
(45, 1, 'Document', 1, '2021-09-27 13:24:25', 1, 2, 2, 1),
(46, 1, 'Static Link', 1, '2021-09-27 14:14:37', 1, 3, 2, 2),
(47, 1, 'React class', 1, '2021-09-27 14:30:09', 1, 4, 2, 3),
(48, 1, 'Block', 1, '2021-09-28 15:05:25', 1, 0, 3, 0),
(49, 1, 'Inline', 1, '2021-09-28 15:05:25', 1, 1, 3, 1),
(50, 1, 'Splitter', 1, '2021-09-29 10:04:14', 1, 22, 1, 15);

-- --------------------------------------------------------

--
-- Table structure for table `_error_reports`
--

DROP TABLE IF EXISTS `_error_reports`;
CREATE TABLE `_error_reports` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 1,
  `name` mediumtext NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `stack` text NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_error_reports`
--

INSERT INTO `_error_reports` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`, `stack`) VALUES
(0, 0, '', 0, '2018-01-13 13:12:21', 0, ''),
(1, 1, 'api/1; 5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36;  (https://node-db-ui.com:8080/#n/4)', 2, '2021-10-22 12:24:03', 2, 'Error: getNodeData called from: \n    at getNodeData (https://node-db-ui.com:8080/assets/index.0f4864a0.js:905:19)\n    at Function.showForm (https://node-db-ui.com:8080/assets/index.0f4864a0.js:4058:24)\n    at goToPageByHash (https://node-db-ui.com:8080/assets/index.0f4864a0.js:768:20)\n    at MainFrame.reloadOptions (https://node-db-ui.com:8080/assets/index.0f4864a0.js:4484:7)'),
(2, 1, 'api/descNode1; 5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36;  (https://node-db-ui.com:8080/#n/20/r/new/e)', 2, '2021-10-22 12:24:03', 2, 'Error: GetData called from: \n    at https://node-db-ui.com:8080/assets/index.0f4864a0.js:1046:19\n    at new Promise (<anonymous>)\n    at getData (https://node-db-ui.com:8080/assets/index.0f4864a0.js:1035:10)\n    at getNode (https://node-db-ui.com:8080/assets/index.0f4864a0.js:867:26)\n    at Function.showForm (https://node-db-ui.com:8080/assets/index.0f4864a0.js:4063:20)\n    at async goToPageByHash (https://node-db-ui.com:8080/assets/index.0f4864a0.js:768:7)'),
(3, 1, 'api/\"<access> Access to node 4 is denied\"; 5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36;  (https://node-db-ui.com:8080/#n/4)', 2, '2021-10-22 14:24:34', 2, 'Error: getNodeData called from: \n    at X (https://node-db-ui.com:8080/assets/index.0f4864a0.js:3:3878)\n    at Function.showForm (https://node-db-ui.com:8080/assets/index.0f4864a0.js:4:54780)\n    at Ut (https://node-db-ui.com:8080/assets/index.0f4864a0.js:3:2173)\n    at ve.reloadOptions (https://node-db-ui.com:8080/assets/index.0f4864a0.js:4:62129)'),
(4, 1, 'api/descNode\"<access> Access to node 4 is denied\"; 5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36;  (https://node-db-ui.com:8080/#n/20/r/new/e)', 2, '2021-10-22 14:24:34', 2, 'Error: GetData called from: \n    at https://node-db-ui.com:8080/assets/index.0f4864a0.js:3:5762\n    at new Promise (<anonymous>)\n    at G (https://node-db-ui.com:8080/assets/index.0f4864a0.js:3:5658)\n    at ne (https://node-db-ui.com:8080/assets/index.0f4864a0.js:3:3384)\n    at Function.showForm (https://node-db-ui.com:8080/assets/index.0f4864a0.js:4:54818)\n    at async Ut (https://node-db-ui.com:8080/assets/index.0f4864a0.js:3:2165)');

-- --------------------------------------------------------

--
-- Table structure for table `_fields`
--

DROP TABLE IF EXISTS `_fields`;
CREATE TABLE `_fields` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `name` varchar(128) NOT NULL DEFAULT '',
  `status` int(1) UNSIGNED NOT NULL DEFAULT 0,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `node_fields_linker` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `show` bigint(15) NOT NULL DEFAULT 0,
  `prior` int(8) NOT NULL DEFAULT 0,
  `fieldType` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `fieldName` varchar(33) NOT NULL DEFAULT '',
  `selectFieldName` varchar(255) NOT NULL DEFAULT '',
  `description` text NOT NULL DEFAULT '',
  `maxLength` int(8) NOT NULL DEFAULT 0,
  `requirement` tinyint(1) NOT NULL DEFAULT 0,
  `unique` tinyint(1) NOT NULL DEFAULT 0,
  `forSearch` tinyint(1) NOT NULL DEFAULT 0,
  `storeInDB` tinyint(1) NOT NULL DEFAULT 0,
  `nodeRef` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `multilingual` tinyint(1) NOT NULL DEFAULT 0,
  `sendToServer` tinyint(1) NOT NULL DEFAULT 0,
  `icon` varchar(24) NOT NULL DEFAULT '',
  `height` int(4) NOT NULL DEFAULT 0,
  `enum` bigint(15) NOT NULL DEFAULT 0,
  `lookupIcon` varchar(33) NOT NULL DEFAULT '',
  `display` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `cssClass` varchar(128) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_fields`
--

INSERT INTO `_fields` (`id`, `name`, `status`, `_usersID`, `_createdON`, `_organizationID`, `node_fields_linker`, `show`, `prior`, `fieldType`, `fieldName`, `selectFieldName`, `description`, `maxLength`, `requirement`, `unique`, `forSearch`, `storeInDB`, `nodeRef`, `multilingual`, `sendToServer`, `icon`, `height`, `enum`, `lookupIcon`, `display`, `cssClass`) VALUES
(0, '', 0, 0, '2014-12-03 00:47:56', 0, 0, 0, 0, 0, '', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(1, 'Document name in the singular', 1, 0, '2014-12-03 00:47:56', 0, 4, 7, 162, 1, 'singleName', '', '', 127, 0, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(2, 'Section name in the plural', 1, 0, '0000-00-00 00:00:00', 0, 4, 255, 22, 1, 'name', '', '', 127, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(3, 'Section description', 1, 0, '0000-00-00 00:00:00', 0, 4, 5, 25, 1, 'description', '', '', 65535, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(4, 'Parent section', 1, 0, '0000-00-00 00:00:00', 0, 4, 7, 23, 7, '_nodesID', '_nodes', '', 4, 1, 0, 1, 1, 4, 0, 1, 'sitemap', 0, 0, '', 1, ''),
(5, 'Name', 1, 0, '0000-00-00 00:00:00', 0, 5, 255, 2, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(6, 'Password', 1, 0, '0000-00-00 00:00:00', 0, 5, 1, 129, 10, 'password', '(\'\')', '', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(7, 'Phone', 1, 0, '2014-12-30 11:54:32', 0, 5, 23, 407, 1, 'PHONE', '', '', 32, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(9, 'Name', 1, 0, '0000-00-00 00:00:00', 0, 6, 255, 3, 1, 'fieldName', '', 'Field`s name which used to store data in database and access field via scripts.', 33, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(10, 'Parent Section', 1, 0, '0000-00-00 00:00:00', 0, 6, 7, 115, 7, 'node_fields_linker', '_nodes', 'Reference to the section this filed beyond of.', 4, 1, 0, 1, 1, 4, 0, 1, '', 0, 0, '', 0, ''),
(11, 'Display Name', 1, 0, '0000-00-00 00:00:00', 0, 6, 255, 2, 1, 'name', '', '', 128, 0, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(12, 'Field description ', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 6, 1, 'description', '', '', 65000, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(13, 'Section id', 1, 0, '0000-00-00 00:00:00', 0, 4, 254, 1, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(14, 'Node name (table name)', 1, 0, '0000-00-00 00:00:00', 0, 4, 5, 160, 1, 'tableName', '', '', 24, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(17, 'Organization name', 1, 0, '0000-00-00 00:00:00', 0, 7, 255, 1, 1, 'name', '', '', 255, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(18, 'Member of', 1, 0, '2014-12-26 16:34:51', 0, 5, 5, 1042, 7, '_organizationID', '_organization', '', 7, 0, 0, 1, 1, 7, 0, 1, '', 0, 0, '', 0, ''),
(20, 'Field type', 1, 0, '0000-00-00 00:00:00', 0, 6, 7, 73, 6, 'fieldType', '', '', 0, 1, 0, 1, 1, 0, 0, 1, '', 0, 1, '', 0, ''),
(21, 'Visibility', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 162, 2, 'show', '', '', 15, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(22, 'In Editable form', 1, 0, '2014-12-20 11:42:21', 0, 6, 5, 164, 5, 'visibility_create', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'edit', 0, 0, '', 1, ''),
(23, 'In List', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 166, 5, 'visibility_list', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'list', 0, 0, '', 1, ''),
(24, 'In Read Only form', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 165, 5, 'visibility_view', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'search', 0, 0, '', 1, ''),
(26, 'Max length', 1, 0, '0000-00-00 00:00:00', 0, 6, 7, 74, 2, 'maxLength', '', '', 8, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(27, 'Is Required', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 137, 5, 'requirement', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(28, 'Is Unique value', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 143, 5, 'unique', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(29, 'For search', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 142, 5, 'forSearch', '', '', 0, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(31, 'Priority', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 5, 2, 'prior', '', '', 8, 1, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(32, 'Store in DB', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 139, 5, 'storeInDB', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'database', 0, 0, '', 1, ''),
(33, 'Priority', 1, 0, '0000-00-00 00:00:00', 0, 4, 7, 24, 2, 'prior', '', '', 8, 1, 0, 0, 1, 0, 0, 1, 'sort-numeric-asc', 0, 0, '', 1, ''),
(35, 'Captcha', 1, 0, '0000-00-00 00:00:00', 0, 4, 5, 284, 5, 'captcha', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'edit', 0, 0, '', 1, ''),
(36, 'Role name', 1, 0, '0000-00-00 00:00:00', 0, 8, 255, 23, 1, 'name', '', '', 45, 1, 1, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(37, 'Description', 1, 0, '2011-05-10 13:15:46', 0, 8, 47, 64, 1, 'description', '', '', 3000, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(38, 'E-mail', 1, 0, '2011-05-13 08:57:09', 0, 5, 19, 125, 1, 'email', '', '', 64, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(39, 'Confirm password', 1, 0, '2011-05-13 09:43:08', 0, 5, 1, 130, 10, 'passwordConfirm', '', '', 128, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, ''),
(40, '', 1, 0, '2011-05-13 10:11:08', 0, 5, 0, 173, 8, 'desc_spl', '', '<div id=\"noNeedLoginHere\"></div> Fill information about your self:', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, ''),
(42, 'Creation date', 1, 0, '0000-00-00 00:00:00', 0, 11, 46, 1, 4, '_createdON', '', '', 0, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(44, 'Message text', 1, 0, '2011-09-19 08:50:41', 0, 11, 5, 4, 1, 'text', '', '', 64000, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(45, 'Sender', 1, 0, '2014-12-02 13:06:31', 0, 11, 46, 6, 7, '_usersID', '_users', '', 5, 0, 0, 1, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, ''),
(47, 'Read', 1, 0, '2011-09-19 09:44:26', 0, 11, 42, 5, 5, 'read', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(48, 'Subject', 1, 0, '2011-09-19 11:16:00', 0, 11, 255, 2, 1, 'name', '', '', 128, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(49, 'Notify on Email about new private messages', 1, 0, '2014-12-30 11:49:56', 0, 5, 1, 339, 5, 'mailing', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(52, 'Parent document', 1, 0, '0000-00-00 00:00:00', 0, 9, 7, 56, 7, 'node_filters_linker', '_nodes', '', 4, 1, 0, 1, 1, 4, 0, 1, '', 0, 0, '', 0, ''),
(53, 'Filter name', 1, 0, '2014-11-28 12:16:09', 0, 9, 255, 2, 1, 'name', '', '', 40, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(54, 'SQL condition', 1, 0, '2014-11-28 12:17:21', 0, 9, 7, 23, 1, 'filter', '', '', 1024, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(55, 'ViewName to select from', 1, 0, '2014-11-28 12:18:21', 0, 9, 7, 34, 1, 'view', '', '', 127, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(56, 'Receiver', 1, 0, '2014-12-02 13:08:17', 0, 11, 47, 1, 7, '_receiverID', '_users', '', 5, 1, 0, 1, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, ''),
(59, 'Avatar', 1, 0, '2014-12-16 13:16:57', 0, 5, 63, 1, 12, 'avatar', '', '', 2000200, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(73, 'Draftable', 1, 0, '2014-12-10 09:45:25', 0, 4, 5, 1354, 5, 'draftable', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'pencil', 0, 0, '', 1, ''),
(90, 'Select from DB name', 1, 0, '2014-12-26 11:15:12', 0, 6, 5, 161, 1, 'selectFieldName', '', '', 127, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(125, 'Created on', 1, 0, '2014-12-26 11:54:19', 0, 4, 1, 9294, 5, 'addCreatedOnFiled', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'calendar', 0, 0, '', 1, ''),
(126, 'Owner (Organization)', 1, 0, '2014-12-26 11:54:33', 0, 4, 1, 10326, 5, 'addCreatedByFiled', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'institution', 0, 0, '', 1, ''),
(138, 'Sort by', 1, 0, '0000-00-00 00:00:00', 0, 4, 5, 217, 7, '_fieldsID', '_fields', '', 6, 0, 0, 1, 1, 6, 0, 1, 'sort-alpha-asc', 0, 0, '', 1, ''),
(139, 'Activation code', 1, 0, '0000-00-00 00:00:00', 0, 5, 0, 876, 1, 'activation', '', '', 16, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(145, 'Owner', 1, 0, '0000-00-00 00:00:00', 0, 4, 1, 10324, 5, 'addCreatorUserFld', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'user', 0, 0, '', 1, ''),
(159, 'Show phone', 1, 0, '0000-00-00 00:00:00', 0, 5, 1, 351, 5, 'show_phone', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(160, 'Show e-mail', 1, 0, '0000-00-00 00:00:00', 0, 5, 1, 350, 5, 'show_email', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(191, 'URL', 1, 0, '2015-02-04 11:30:51', 0, 4, 5, 10341, 1, 'staticLink', '', '', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(196, 'First name', 1, 0, '2015-02-10 10:18:52', 0, 5, 0, 188, 1, 'firstName', '', '', 20, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(197, 'Last name', 1, 0, '2015-02-10 10:40:46', 0, 5, 0, 187, 1, 'lastName', '', '', 32, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(198, 'Mid name', 1, 0, '2015-02-10 10:41:46', 0, 5, 0, 189, 1, 'midName', '', '', 24, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(199, 'Company', 1, 0, '2015-02-10 10:42:37', 0, 5, 63, 123, 1, 'company', '', '', 127, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(200, 'Title', 1, 0, '2015-02-10 10:43:32', 0, 5, 5, 124, 1, 'title', '', '', 200, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(201, 'About', 1, 0, '2015-02-10 10:44:21', 0, 5, 5, 126, 1, 'description', '', '', 2048, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(202, 'Web site', 1, 0, '2015-02-10 10:45:16', 0, 5, 0, 316, 1, 'www', '', '', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(203, 'Skype', 1, 0, '2015-02-10 10:47:50', 0, 5, 1, 897, 1, 'skype', '', '', 32, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(204, 'VK', 1, 0, '2015-02-10 10:52:46', 0, 5, 1, 898, 1, 'soc_vk', '', '', 80, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(205, 'Facebook', 1, 0, '2015-02-10 10:53:15', 0, 5, 1, 899, 1, 'soc_fb', '', '', 80, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(206, 'Google+', 1, 0, '2015-02-10 10:54:47', 0, 5, 1, 900, 1, 'soc_google', '', '', 90, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(207, 'Twitter', 1, 0, '2015-02-10 10:55:15', 0, 5, 1, 901, 752, 'soc_twitter', '', '', 80, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(218, 'Common information', 1, 0, '2015-02-25 10:24:25', 0, 5, 5, 1, 17, 't_main', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'user', 0, 0, '', 0, ''),
(219, 'Social networks', 1, 0, '2015-02-25 10:24:59', 0, 5, 5, 406, 17, 't_soc', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'facebook-square', 0, 0, '', 0, ''),
(221, 'Settings', 1, 0, '2015-02-25 10:43:35', 0, 5, 1, 131, 17, 't_priv', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'cog', 0, 0, '', 0, ''),
(222, 'Change Password', 1, 0, '2015-02-25 10:46:11', 0, 5, 1, 128, 17, 't_pass', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'key', 0, 0, '', 0, ''),
(234, 'Show Skype', 1, 0, '2015-05-29 10:18:26', 0, 5, 0, 884, 5, 'show_skype', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(235, 'Show VK', 1, 0, '2015-05-29 10:21:33', 0, 5, 1, 352, 5, 'show_vk', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(236, 'Show Facebook', 1, 0, '2015-05-29 10:22:25', 0, 5, 1, 353, 5, 'show_facebook', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(237, 'Show Google+', 1, 0, '2015-05-29 10:23:34', 0, 5, 1, 374, 5, 'show_google', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(238, 'Show Twitter', 1, 0, '2015-05-29 10:24:24', 0, 5, 0, 883, 5, 'show_twitter', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(243, 'Document name', 1, 0, '0000-00-00 00:00:00', 0, 49, 255, 0, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(244, 'Body', 1, 0, '2015-11-11 06:13:52', 0, 49, 5, 91, 19, 'body', '', '', 8000999, 0, 0, 0, 1, 0, 1, 1, '', 999, 0, '', 0, ''),
(245, 'Link', 1, 0, '2015-11-11 06:34:51', 0, 49, 5, 21, 1, 'link', '', '', 0, 0, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, ''),
(246, 'File name', 1, 0, '2015-11-11 07:17:47', 0, 49, 5, 32, 1, 'title', '', '', 127, 1, 1, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(251, 'Moderators', 1, 0, '2016-02-07 15:14:02', 0, 7, 5, 82, 14, '_organization_users', '_users', '', 5, 0, 0, 0, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, ''),
(252, 'Records per page', 1, 0, '2016-02-08 16:39:22', 0, 4, 5, 264, 2, 'recPerPage', '', '', 3, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(253, 'Related Section', 1, 0, '2015-03-16 09:36:21', 0, 6, 5, 94, 7, 'nodeRef', '_nodes', '', 0, 0, 0, 1, 1, 4, 0, 1, '', 0, 0, '', 0, ''),
(256, 'Icon', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 4, 1, 'icon', '', '', 24, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(287, 'Roles', 1, 1, '2016-03-14 10:31:44', 0, 5, 1, 127, 14, '_user_roles', '_roles', '', 0, 0, 0, 0, 1, 8, 0, 1, '', 0, 0, '', 0, ''),
(288, 'Role owners', 1, 1, '2016-03-14 10:31:44', 0, 8, 5, 87, 14, '_user_roles', '_users', '', 0, 0, 0, 0, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, ''),
(295, 'Creation name', 1, 1, '2016-03-21 04:15:14', 0, 4, 1, 202, 1, 'creationName', '', 'Name which will be used on creation page. Useful for some not English languages. You can keep this field empty.', 64, 0, 0, 0, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(305, 'Phone', 1, 1, '2016-03-24 04:28:50', 0, 5, 21, 1002, 1, 'public_phone', '', '', 32, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(306, 'VK', 1, 1, '2016-03-24 04:29:46', 0, 5, 5, 1012, 1, 'public_vk', '', '', 80, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(307, 'Facebook', 1, 1, '2016-03-24 04:31:40', 0, 5, 5, 1022, 1, 'public_fb', '', '', 80, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(308, 'Google+', 1, 1, '2016-03-24 04:32:24', 0, 5, 5, 1032, 1, 'public_google', '', '', 90, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(309, 'E-mail', 1, 1, '2016-03-24 05:02:54', 0, 5, 21, 992, 1, 'public_email', '', '', 50, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(310, 'Name', 1, 0, '2016-03-28 04:20:08', 0, 52, 255, 1, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(311, 'Display name', 1, 0, '2016-03-28 04:46:54', 0, 53, 255, 10, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 1, 1, '', 0, 0, '', 0, ''),
(312, 'Value', 1, 1, '2016-03-28 04:52:09', 0, 53, 47, 31, 2, 'value', '', '', 11, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(314, 'List', 1, 1, '2016-03-28 04:57:51', 0, 52, 5, 21, 15, 'values', '', '', 0, 0, 0, 0, 0, 53, 0, 1, '', 0, 0, '', 0, ''),
(315, 'Enumeration', 1, 1, '2016-03-28 04:57:52', 0, 53, 1, 1050, 7, 'values_linker', '_enums', '', 0, 0, 0, 1, 1, 52, 0, 1, '', 0, 0, '', 0, ''),
(316, 'Enumeration', 1, 1, '2016-03-28 05:26:41', 0, 6, 5, 115, 7, 'enum', '_enums', '', 0, 0, 0, 0, 1, 52, 0, 1, '', 0, 0, '', 0, ''),
(318, 'In Drop-Down List', 1, 1, '2016-04-05 05:27:23', 0, 6, 5, 169, 5, 'visibility_dropdownList', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'list-alt', 0, 0, '', 1, ''),
(325, 'Multilingual field', 1, 1, '2016-04-19 11:05:25', 0, 6, 7, 143, 5, 'multilingual', '', '', 0, 0, 0, 1, 1, 0, 0, 1, 'language', 0, 0, '', 1, ''),
(326, 'Name', 1, 0, '2016-04-19 11:10:20', 0, 12, 255, 1, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(327, 'Lang code (en, ru, ...)', 1, 1, '2016-04-19 11:11:58', 0, 12, 7, 11, 1, 'code', '', '', 2, 0, 1, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(328, 'Multilingual enabled', 1, 1, '2016-04-22 10:31:08', 0, 5, 0, 247, 5, 'multilingualEnabled', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(343, 'Properties', 1, 1, '2016-05-04 04:59:18', 0, 4, 5, 10352, 17, 't_property', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'cog', 0, 0, '', 0, ''),
(344, 'Fields', 1, 1, '2016-05-04 05:00:39', 0, 4, 5, 10362, 17, 't_fields', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'list', 0, 0, '', 0, ''),
(345, '', 1, 1, '2016-05-04 05:02:22', 0, 4, 5, 10363, 15, 'node_fields', '', '', 0, 0, 0, 0, 0, 6, 0, 1, '', 0, 0, '', 0, ''),
(352, 'Reverse sorting', 1, 1, '2016-05-16 04:41:01', 0, 4, 5, 218, 5, 'reverse', '', '', 0, 0, 0, 0, 1, 0, 0, 1, 'sort-alpha-desc', 0, 0, '', 1, ''),
(357, 'In Custom-View List', 1, 0, '0000-00-00 00:00:00', 0, 6, 5, 167, 5, 'visibility_customList', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'th', 0, 0, '', 1, ''),
(397, 'Icon', 1, 1, '2016-08-09 04:13:55', 0, 4, 5, 22, 1, 'icon', '', '', 24, 0, 0, 0, 1, 0, 0, 1, 'photo', 0, 0, '', 1, ''),
(486, 'Send to server', 1, 1, '2016-10-28 06:12:28', 0, 6, 1, 138, 5, 'sendToServer', '', 'If true data of this field will not be sent to server and uses only for client side operating.', 0, 0, 0, 1, 1, 0, 0, 1, 'upload', 0, 0, '', 1, ''),
(573, 'High priority query', 1, 1, '2017-03-28 05:47:55', 0, 9, 3, 22, 5, 'hiPriority', '', '', 1, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(619, 'Error', 1, 0, '2017-04-24 02:35:25', 0, 81, 255, 0, 1, 'name', '', '', 200000, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(620, 'Creation date', 1, 0, '2017-04-24 02:35:25', 0, 81, 63, 11, 4, '_createdON', '', '', 0, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(621, 'Organization', 1, 0, '2017-04-24 02:35:25', 0, 81, 6, 13, 7, '_organizationID', '_organization', '', 0, 0, 0, 1, 1, 7, 0, 1, '', 0, 0, '', 0, ''),
(622, 'User', 1, 0, '2017-04-24 02:35:25', 0, 81, 7, 12, 7, '_usersID', '_users', '', 0, 0, 0, 1, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, ''),
(623, 'Stack', 1, 1, '2017-04-24 02:37:08', 4, 81, 5, 1, 1, 'stack', '', '', 4000, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(651, 'Additional SELECT fields', 1, 1, '2017-07-03 02:10:13', 33, 9, 3, 24, 1, 'fields', '', '', 255, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(656, 'UI Language', 1, 1, '2018-01-04 20:02:24', 1, 5, 1, 132, 7, 'language', '_languages', '', 0, 0, 0, 1, 1, 12, 0, 1, '', 0, 0, 'lang_icon', 0, ''),
(657, 'Icon', 1, 1, '2018-01-04 20:20:41', 1, 12, 63, 2, 12, 'lang_icon', '', '', 600030, 0, 0, 0, 1, 0, 0, 1, '', 30, 0, '', 0, ''),
(658, 'Width', 1, 1, '2018-01-12 18:54:03', 1, 6, 1, 144, 2, 'width', '', '', 5, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, ''),
(659, 'Height', 1, 1, '2018-01-12 18:55:34', 1, 6, 5, 145, 2, 'height', '', '', 4, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(660, 'Common', 1, 1, '2016-03-14 06:11:03', 0, 7, 5, 0, 17, 't_common', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'tags', 0, 0, '', 0, ''),
(662, '', 1, 1, '2018-01-13 13:49:29', 1, 7, 5, 3, 15, 'org_members', '', '', 0, 0, 0, 0, 0, 5, 0, 1, '', 0, 0, '', 0, ''),
(664, 'Members', 1, 1, '2018-01-13 13:54:01', 1, 7, 5, 2, 17, 't_members', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'users', 0, 0, '', 0, ''),
(665, 'Name', 1, 0, '2021-07-02 12:26:32', 0, 83, 255, 0, 1, 'name', '', '', 64, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(666, 'Created on', 1, 0, '2021-07-02 12:26:32', 0, 83, 62, 1, 4, '_createdON', '', '', 0, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(667, 'Organization', 1, 0, '2021-07-02 12:26:32', 0, 83, 6, 22, 7, '_organizationID', '_organization', '', 0, 0, 0, 1, 1, 7, 0, 1, '', 0, 0, '', 0, ''),
(668, 'Owner', 1, 0, '2021-07-02 12:26:32', 0, 83, 6, 23, 7, '_usersID', '_users', '', 0, 0, 0, 1, 1, 5, 0, 1, '', 0, 0, 'avatar', 0, ''),
(669, 'File', 1, 1, '2021-07-02 12:28:04', 1, 83, 63, 11, 21, 'file', '', '', 0, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(728, 'order', 1, 1, '2021-07-20 14:27:45', 1, 53, 59, 41, 2, 'order', '', 'to have ordering in 1toN lookups, just add field \'order\'  to target node.', 9, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(751, 'Is UI language', 1, 1, '2021-09-13 11:10:19', 1, 12, 7, 21, 5, 'isUILanguage', '', 'Used to load localization data for user UI. locales/xx/lang.ts', 2, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(752, 'Filter id', 1, 0, '0000-00-00 00:00:00', 0, 9, 254, 1, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(753, 'Default filter', 1, 1, '2021-09-13 12:34:29', 1, 4, 5, 263, 7, 'defaultFilterId', '_filters', '', 0, 0, 0, 1, 1, 9, 0, 1, 'filter', 0, 0, '', 0, ''),
(754, 'Field id', 1, 0, '0000-00-00 00:00:00', 0, 6, 254, 1, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(755, 'Language id', 1, 0, '0000-00-00 00:00:00', 0, 12, 254, 0, 2, 'id', '', '', 15, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(800, 'Store forms in DB', 1, 1, '2021-09-17 18:10:57', 1, 4, 7, 149, 5, 'storeForms', '', '', 0, 0, 0, 1, 1, 0, 0, 1, 'database', 0, 0, '', 1, ''),
(801, 'Username', 1, 1, '2021-09-19 08:59:38', 1, 20, 255, 14, 1, 'username', '', '', 64, 1, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, ''),
(802, 'Password', 1, 1, '2021-09-19 09:16:52', 1, 20, 63, 15, 10, 'password', '', '', 128, 1, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, ''),
(803, ' ', 1, 1, '2021-09-22 11:14:05', 1, 49, 1, 31, 8, 'clickableLink', '', '<a class=\"clickable-link\" target=\"_blank\"><span class=\"clickable-link-text\">link</span></a>', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, ''),
(804, 'Username', 1, 1, '2021-09-22 12:49:00', 1, 21, 0, 11, 1, 'name', '', '', 64, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(805, 'Password', 1, 1, '2021-09-22 12:49:38', 1, 21, 1, 22, 10, 'password', '', '', 128, 1, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(806, 'Repeat password', 1, 1, '2021-09-22 12:50:30', 1, 21, 1, 51, 10, 'passwordConfirm', '', '', 128, 1, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, ''),
(807, 'Email', 1, 1, '2021-09-22 13:41:21', 1, 21, 63, 21, 1, 'email', '', '', 64, 1, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(808, 'salt', 1, 1, '2021-09-22 14:43:09', 1, 21, 0, 101, 1, 'salt', '', '', 32, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(809, 'activationKey', 1, 1, '2021-09-22 14:44:03', 1, 21, 0, 81, 1, 'activationKey', '', '', 48, 0, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(810, 'Forgot my password', 1, 1, '2021-09-23 12:31:06', 1, 20, 63, 27, 18, 'forgotPasswordButton', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 1, 'link-button-field'),
(811, 'Already have an account?', 1, 1, '2021-09-23 12:35:07', 1, 21, 1, 61, 18, 'alreadyHaveAccountBtn', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, 'link-button-field'),
(812, 'Sign up', 1, 1, '2021-09-23 12:46:53', 1, 20, 1, 28, 18, 'signUpLinkBtn', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 1, 'link-button-field'),
(813, 'Email', 1, 1, '2021-09-23 13:16:58', 1, 22, 1, 35, 1, 'email', '', '', 64, 1, 0, 0, 0, 0, 0, 1, '', 0, 0, '', 0, ''),
(814, 'salt', 1, 1, '2021-09-22 14:43:09', 1, 5, 0, 101, 1, 'salt', '', '', 32, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(815, 'Node type', 1, 1, '2021-09-27 13:26:21', 1, 4, 63, 109, 6, 'nodeType', '', '', 0, 1, 0, 1, 1, 0, 0, 1, '', 0, 2, '', 0, ''),
(816, 'Lookup icon select name', 1, 1, '2021-09-28 08:54:22', 1, 6, 1, 179, 1, 'lookupIcon', '', '', 33, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(817, 'Automatically create fields', 1, 1, '2021-09-28 10:35:39', 1, 4, 5, 1384, 22, 'createFields', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, ''),
(818, 'Data storage settings', 1, 1, '2021-09-28 10:42:06', 1, 4, 1, 119, 22, 'dataStorageGroup', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'database', 0, 0, '', 0, ''),
(819, 'Appearance settings', 1, 1, '2021-09-28 10:42:55', 1, 4, 1, 161, 22, 'appearanceGroup', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 0, ''),
(820, 'Enumeration id', 1, 0, '0000-00-00 00:00:00', 0, 52, 2, 0, 2, 'id', '', '', 15, 1, 0, 1, 1, 0, 0, 1, '', 0, 0, '', 0, ''),
(821, 'Data storage settings', 1, 1, '2021-09-28 12:27:47', 1, 6, 1, 73, 22, 'storageSettingSplitter', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'database', 0, 0, '', 0, ''),
(822, 'Field visibility', 1, 1, '2021-09-28 12:29:10', 1, 6, 1, 150, 22, 'visibilitySplitter', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'eye', 0, 0, '', 0, ''),
(823, 'Display', 1, 1, '2021-09-28 15:06:12', 1, 6, 1, 16, 6, 'display', '', '', 0, 0, 0, 0, 1, 0, 0, 1, '', 0, 3, '', 1, ''),
(824, '', 1, 1, '2016-05-04 05:02:22', 0, 4, 5, 10368, 15, 'node_filters', '', '', 0, 0, 0, 0, 0, 9, 0, 1, '', 0, 0, '', 0, ''),
(825, 'Filters', 1, 1, '2016-05-04 05:00:39', 0, 4, 5, 10366, 17, 't_filters', '', '', 0, 0, 0, 0, 0, 0, 0, 1, 'list', 0, 0, '', 0, ''),
(826, 'Additional CSS class', 1, 1, '2021-10-21 06:54:50', 1, 6, 5, 26, 1, 'cssClass', '', 'Separate multiply classes with space', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(827, 'Additional CSS class', 1, 1, '2021-10-21 07:22:29', 1, 4, 5, 1364, 1, 'cssClass', '', 'Separate multiply classes with space', 128, 0, 0, 0, 1, 0, 0, 1, '', 0, 0, '', 1, ''),
(828, 'I change my mind', 1, 1, '2021-10-22 10:46:41', 1, 22, 1, 45, 18, 'backToLogin', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 0, '', 1, 'link-button-field'),
(829, 'Or sign with:', 1, 1, '2021-10-23 08:54:27', 1, 20, 1, 26, 8, 'socialLoginButtons', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '0', 0, 0, '', 0, ''),
(830, 'Sign In', 1, 1, '2021-10-26 12:23:00', 1, 20, 1, 25, 18, 'signInBtn', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'sign-in', 0, 0, '', 0, 'sign-in-button'),
(831, 'In Sub-Form List', 1, 1, '2021-10-29 08:49:54', 1, 6, 7, 179, 5, 'visibility_subFormList', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 'list-ul', 0, 0, '', 1, ''),
(832, 'Roles', 1, 1, '2021-11-05 11:18:07', 1, 9, 5, 86, 14, '_filter_access_roles', '_roles', '', 0, 0, 0, 1, 1, 8, 0, 1, 'user', 0, 0, '', 0, ''),
(833, 'Order', 1, 1, '2021-11-05 11:43:01', 1, 9, 5, 66, 2, 'order', '', '', 7, 0, 0, 1, 1, 0, 0, 1, 'sort-numeric-asc', 0, 0, '', 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `_files`
--

DROP TABLE IF EXISTS `_files`;
CREATE TABLE `_files` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 1,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `file` varchar(127) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_files`
--

INSERT INTO `_files` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`, `file`) VALUES
(0, 0, '', 0, '2021-07-02 15:26:32', 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `_filters`
--

DROP TABLE IF EXISTS `_filters`;
CREATE TABLE `_filters` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 0,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `node_filters_linker` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `name` varchar(40) NOT NULL DEFAULT '',
  `filter` text NOT NULL DEFAULT '',
  `view` varchar(127) NOT NULL DEFAULT '',
  `hiPriority` tinyint(1) NOT NULL DEFAULT 0,
  `fields` varchar(255) NOT NULL DEFAULT '',
  `order` int(7) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_filters`
--

INSERT INTO `_filters` (`id`, `status`, `_usersID`, `_createdON`, `_organizationID`, `node_filters_linker`, `name`, `filter`, `view`, `hiPriority`, `fields`, `order`) VALUES
(0, 0, 0, '2014-12-02 14:00:08', 0, 0, '', '', '', 0, '', 0),
(1, 1, 1, '2014-12-02 14:00:08', 0, 11, 'All', '((_messages._usersID=@userId) OR (_receiverID=@userId))', '', 0, '', 0),
(2, 1, 1, '2014-12-02 13:57:33', 0, 11, 'Unread', '((`read` = 0) AND (_receiverID=@userId))', '', 0, '', 0),
(3, 1, 1, '2014-12-02 13:59:36', 0, 11, 'Sent', '(_messages._usersID=@userId)', '', 0, '', 0),
(4, 1, 1, '2014-12-02 15:24:07', 0, 11, 'Income', '(_receiverID=@userId)', '', 0, '', 0),
(8, 1, 1, '2021-09-13 12:08:39', 1, 4, 'Can have filter', '(nodeType = 2 AND storeForms = 1) ', '', 0, '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `_filter_access_roles`
--

DROP TABLE IF EXISTS `_filter_access_roles`;
CREATE TABLE `_filter_access_roles` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `_filtersid` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_rolesid` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `_html`
--

DROP TABLE IF EXISTS `_html`;
CREATE TABLE `_html` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 0,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `body` mediumtext NOT NULL DEFAULT '',
  `title` varchar(127) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_html`
--

INSERT INTO `_html` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`, `body`, `title`) VALUES
(0, 0, '', 0, '2015-11-11 03:28:36', 0, '', '');

-- --------------------------------------------------------

--
-- Table structure for table `_languages`
--

DROP TABLE IF EXISTS `_languages`;
CREATE TABLE `_languages` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 1,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `code` varchar(2) NOT NULL DEFAULT '',
  `lang_icon` varchar(30) NOT NULL DEFAULT '',
  `isUILanguage` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_languages`
--

INSERT INTO `_languages` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`, `code`, `lang_icon`, `isUILanguage`) VALUES
(0, 0, '', 0, '2018-01-04 19:56:58', 0, '', '', 0),
(1, 1, 'English', 1, '2016-04-19 11:12:10', 0, '', '57/5592b6e226551.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `_messages`
--

DROP TABLE IF EXISTS `_messages`;
CREATE TABLE `_messages` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 0,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `text` text NOT NULL DEFAULT '',
  `messagesID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `name` varchar(128) NOT NULL DEFAULT '',
  `_receiverID` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_messages`
--

INSERT INTO `_messages` (`id`, `status`, `_usersID`, `_createdON`, `_organizationID`, `text`, `messagesID`, `read`, `name`, `_receiverID`) VALUES
(0, 0, 0, '2021-10-03 11:40:11', 0, '', 0, 0, '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `_nodes`
--

DROP TABLE IF EXISTS `_nodes`;
CREATE TABLE `_nodes` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `nodeType` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_nodesID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '1-public; 2-template; 0-deleted',
  `tableName` varchar(24) NOT NULL DEFAULT '',
  `singleName` varchar(127) NOT NULL DEFAULT '',
  `name` varchar(127) NOT NULL DEFAULT '',
  `description` text NOT NULL DEFAULT '',
  `prior` int(8) NOT NULL DEFAULT 0,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `captcha` tinyint(1) NOT NULL DEFAULT 0,
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `draftable` tinyint(1) NOT NULL DEFAULT 0,
  `_fieldsID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `staticLink` varchar(128) NOT NULL DEFAULT '',
  `recPerPage` int(3) NOT NULL DEFAULT 0,
  `icon` varchar(24) NOT NULL DEFAULT '',
  `creationName` varchar(64) NOT NULL DEFAULT '',
  `reverse` tinyint(1) NOT NULL DEFAULT 0,
  `defaultFilterId` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `storeForms` tinyint(1) NOT NULL DEFAULT 0,
  `cssClass` varchar(128) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_nodes`
--

INSERT INTO `_nodes` (`id`, `nodeType`, `_nodesID`, `status`, `tableName`, `singleName`, `name`, `description`, `prior`, `_usersID`, `_createdON`, `captcha`, `_organizationID`, `draftable`, `_fieldsID`, `staticLink`, `recPerPage`, `icon`, `creationName`, `reverse`, `defaultFilterId`, `storeForms`, `cssClass`) VALUES
(0, 1, 0, 0, '', '', '', '', 0, 0, '0000-00-00 00:00:00', 0, 0, 0, 0, '', 0, '', '', 0, 0, 0, ''),
(1, 4, 50, 1, 'AdminRolePrivilegesForm', 'Right access form', 'Right access form', '', 994, 1, '2016-03-15 05:17:01', 0, 0, 0, 0, '', 25, '', '', 0, 0, 0, ''),
(2, 1, 0, 1, '', 'Root', 'Root', '', 12, 0, '0000-00-00 00:00:00', 0, 0, 0, 0, '', 10, '', '', 0, 0, 0, ''),
(3, 1, 2, 1, '', 'Administration', 'Administration', '', 480, 0, '0000-00-00 00:00:00', 0, 0, 0, 0, '', 10, 'gear', '', 0, 0, 0, ''),
(4, 2, 10, 1, '_nodes', 'Section', 'Sections', 'Website\'s section', 9, 0, '2014-12-19 09:18:48', 0, 0, 1, 13, '', 25, 'sitemap', '', 1, 0, 1, ''),
(5, 2, 3, 1, '_users', 'User', 'Users', '', 8, 0, '2014-12-03 01:04:55', 0, 0, 0, 0, '', 50, 'user', '', 0, 0, 1, ''),
(6, 2, 10, 1, '_fields', 'Field', 'Fields', '', 11, 0, '0000-00-00 00:00:00', 0, 0, 1, 10, '', 20, 'edit', '', 0, 0, 1, ''),
(7, 2, 3, 1, '_organization', 'Organization', 'Organizations', '', 12, 0, '0000-00-00 00:00:00', 0, 0, 0, 0, '', 10, 'institution', '', 0, 0, 1, ''),
(8, 2, 3, 1, '_roles', 'Role', 'Roles', '', 10, 0, '2011-05-05 11:36:20', 0, 0, 0, 0, '', 10, 'id-badge', '', 0, 0, 1, ''),
(9, 2, 10, 1, '_filters', 'Filter', 'Filters', '', 55, 0, '2014-12-03 01:05:15', 0, 0, 1, 752, '', 40, 'filter', '', 1, 0, 1, ''),
(10, 1, 2, 1, '', 'Deep Administration', 'Deep Administration', 'Danger zone. Please make changes here only if you know what you doing.', 1373, 0, '2014-12-23 15:44:46', 0, 0, 0, 0, '', 10, 'wrench', '', 0, 0, 0, ''),
(11, 2, 3, 1, '_messages', 'Message', 'Messages', '', 103, 0, '2014-12-23 15:45:06', 0, 0, 0, 0, '', 10, 'envelope', '', 0, 1, 1, ''),
(12, 2, 10, 1, '_languages', 'Language', 'Languages', '', 995, 1, '2016-04-19 11:10:20', 0, 0, 0, 0, '', 25, 'flag', '', 0, 0, 1, ''),
(20, 2, 50, 1, '_login', ' Sign-in', ' Sign-in', '', 1, 1, '2021-09-19 08:48:43', 1, 1, 0, 0, '', 25, 'sign-in', '', 0, 0, 0, 'login-form'),
(21, 2, 50, 1, '_registration', 'Create a New Account', 'Create a New Account', '', 22, 1, '2021-09-22 13:13:47', 1, 1, 0, 0, '', 25, 'check', '', 0, 0, 1, 'login-form'),
(22, 2, 50, 1, '_resetPassword', 'Reset password', 'Reset password', '', 12, 1, '2021-09-23 13:16:23', 1, 1, 0, 0, '', 25, '', '', 0, 0, 0, 'login-form'),
(49, 2, 3, 1, '_html', 'Page', 'Pages', '', 223, 0, '2015-11-11 06:11:54', 0, 0, 0, 193, '', 10, 'file-o', '', 0, 0, 1, ''),
(50, 1, 0, 1, '', 'Hidden section', 'Hidden sections', '', 0, 0, '2015-12-24 09:16:16', 0, 0, 0, 0, '', 10, '', '', 0, 0, 0, ''),
(52, 2, 3, 1, '_enums', 'Enumeration', 'Enumerations', '', 1024, 1, '2016-03-28 04:20:08', 0, 0, 0, 0, '', 25, 'list', '', 0, 0, 1, ''),
(53, 2, 50, 1, '_enum_values', 'Enumeration value', 'Enumeration values', '', 994, 1, '2016-03-28 04:46:54', 0, 0, 0, 312, '', 25, '', '', 0, 0, 1, ''),
(81, 2, 3, 1, '_error_reports', 'Error report', 'Error reports', '', 130, 1, '2017-04-24 02:35:25', 0, 4, 0, 620, '', 25, 'bug', '', 1, 0, 1, ''),
(83, 2, 3, 1, '_files', 'File', 'Files', '', 91, 1, '2021-07-02 15:26:32', 0, 1, 0, 0, '', 25, 'file', '', 0, 0, 1, '');

-- --------------------------------------------------------

--
-- Table structure for table `_organization`
--

DROP TABLE IF EXISTS `_organization`;
CREATE TABLE `_organization` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `status` int(1) UNSIGNED NOT NULL DEFAULT 0,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_organization`
--

INSERT INTO `_organization` (`id`, `name`, `status`, `_usersID`, `_createdON`, `_organizationID`) VALUES
(0, '', 0, 0, '0000-00-00 00:00:00', 0),
(1, 'admin group', 1, 0, '0000-00-00 00:00:00', 1),
(2, 'guest group', 1, 0, '0000-00-00 00:00:00', 2),
(3, 'user group', 1, 0, '0000-00-00 00:00:00', 3);

-- --------------------------------------------------------

--
-- Table structure for table `_organization_users`
--

DROP TABLE IF EXISTS `_organization_users`;
CREATE TABLE `_organization_users` (
  `id` int(15) NOT NULL,
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `_registration`
--

DROP TABLE IF EXISTS `_registration`;
CREATE TABLE `_registration` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `status` int(1) UNSIGNED NOT NULL DEFAULT 1,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_usersID` bigint(15) UNSIGNED NOT NULL,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `password` text NOT NULL,
  `email` varchar(64) NOT NULL DEFAULT '',
  `salt` varchar(32) NOT NULL DEFAULT '',
  `activationKey` varchar(48) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_registration`
--

INSERT INTO `_registration` (`id`, `status`, `name`, `_usersID`, `_createdON`, `_organizationID`, `password`, `email`, `salt`, `activationKey`) VALUES
(0, 0, '', 0, '2021-09-22 13:13:47', 0, '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `_roles`
--

DROP TABLE IF EXISTS `_roles`;
CREATE TABLE `_roles` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `name` varchar(45) NOT NULL DEFAULT '',
  `status` int(1) NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `description` text NOT NULL DEFAULT '',
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_roles`
--

INSERT INTO `_roles` (`id`, `name`, `status`, `_createdON`, `_usersID`, `description`, `_organizationID`) VALUES
(0, '', 0, '2018-01-13 13:16:17', 0, '', 0),
(1, 'Super admin', 1, '0000-00-00 00:00:00', 1, 'Full access for all sections', 0),
(2, 'Guest', 1, '2014-12-15 10:07:32', 1, 'Role assigned to each unauthorized user', 0),
(3, 'User', 1, '2014-12-12 15:39:47', 1, 'Role assigned to each authorized user', 0),
(7, 'View all', 1, '2016-03-07 00:00:00', 1, 'Read only access to all sections', 0);

-- --------------------------------------------------------

--
-- Table structure for table `_role_privileges`
--

DROP TABLE IF EXISTS `_role_privileges`;
CREATE TABLE `_role_privileges` (
  `nodeID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `roleID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `privileges` int(8) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_role_privileges`
--

INSERT INTO `_role_privileges` (`nodeID`, `roleID`, `privileges`) VALUES
(0, 1, 65535),
(2, 2, 4),
(12, 2, 7),
(20, 2, 4),
(21, 2, 12),
(22, 2, 4),
(49, 2, 4),
(81, 2, 8),
(83, 2, 4),
(2, 3, 4),
(5, 3, 17),
(11, 3, 1),
(12, 3, 7),
(22, 3, 4),
(49, 3, 4),
(81, 3, 8),
(83, 3, 4),
(0, 7, 7);

-- --------------------------------------------------------

--
-- Table structure for table `_users`
--

DROP TABLE IF EXISTS `_users`;
CREATE TABLE `_users` (
  `id` bigint(15) UNSIGNED NOT NULL,
  `name` varchar(64) NOT NULL DEFAULT '',
  `_organizationID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `password` varchar(128) NOT NULL DEFAULT '',
  `salt` varchar(32) NOT NULL DEFAULT '',
  `status` int(8) NOT NULL DEFAULT 0,
  `PHONE` varchar(32) NOT NULL DEFAULT '',
  `blocked_to` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `mistakes` int(8) NOT NULL DEFAULT 3,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_createdON` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(64) NOT NULL DEFAULT '',
  `mailing` tinyint(1) NOT NULL DEFAULT 0,
  `avatar` varchar(130) NOT NULL DEFAULT '',
  `resetCode` varchar(32) NOT NULL DEFAULT '',
  `reset_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `show_phone` tinyint(1) NOT NULL DEFAULT 0,
  `show_email` tinyint(1) NOT NULL DEFAULT 0,
  `firstName` varchar(20) NOT NULL DEFAULT '',
  `lastName` varchar(32) NOT NULL DEFAULT '',
  `midName` varchar(24) NOT NULL DEFAULT '',
  `company` varchar(127) NOT NULL DEFAULT '',
  `title` varchar(200) NOT NULL DEFAULT '',
  `description` text NOT NULL DEFAULT '',
  `www` varchar(128) NOT NULL DEFAULT '',
  `skype` varchar(32) NOT NULL DEFAULT '',
  `soc_vk` varchar(80) NOT NULL DEFAULT '',
  `soc_fb` varchar(80) NOT NULL DEFAULT '',
  `soc_google` varchar(90) NOT NULL DEFAULT '',
  `soc_twitter` varchar(80) NOT NULL DEFAULT '',
  `show_skype` tinyint(1) NOT NULL DEFAULT 0,
  `show_vk` tinyint(1) NOT NULL DEFAULT 0,
  `show_facebook` tinyint(1) NOT NULL DEFAULT 0,
  `show_google` tinyint(1) NOT NULL DEFAULT 0,
  `show_twitter` tinyint(1) NOT NULL DEFAULT 0,
  `public_phone` varchar(32) NOT NULL DEFAULT '',
  `public_vk` varchar(80) NOT NULL DEFAULT '',
  `public_fb` varchar(80) NOT NULL DEFAULT '',
  `public_google` varchar(90) NOT NULL DEFAULT '',
  `public_email` varchar(50) NOT NULL DEFAULT '',
  `multilingualEnabled` tinyint(1) NOT NULL DEFAULT 0,
  `defaultOrg` bigint(15) NOT NULL DEFAULT 0,
  `language` bigint(15) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_users`
--

INSERT INTO `_users` (`id`, `name`, `_organizationID`, `password`, `salt`, `status`, `PHONE`, `blocked_to`, `mistakes`, `_usersID`, `_createdON`, `email`, `mailing`, `avatar`, `resetCode`, `reset_time`, `show_phone`, `show_email`, `firstName`, `lastName`, `midName`, `company`, `title`, `description`, `www`, `skype`, `soc_vk`, `soc_fb`, `soc_google`, `soc_twitter`, `show_skype`, `show_vk`, `show_facebook`, `show_google`, `show_twitter`, `public_phone`, `public_vk`, `public_fb`, `public_google`, `public_email`, `multilingualEnabled`, `defaultOrg`, `language`) VALUES
(0, '', 0, '', '', 0, '', '2014-11-01 20:35:57', -20, 0, '2014-12-30 11:54:50', '', 0, '', '', '2016-01-13 10:49:47', 0, 0, '', '', '', '', '', '', '', '', '', '', '', '', 0, 0, 0, 0, 0, '', '', '', '', '', 0, 0, 0),
(1, 'admin', 1, 'a1c16809be394ccce59d228609d8db9b209cbd8636ba3925b00025ac862e57c9cc0789a937db9839f0b294f93467d5671f70750ae85f713fbcaa6a61c0dcbeef', 'a803e7567d6214fd199a10dc8ea4d5b2', 1, '', '2014-11-01 20:35:57', 3, 1, '2014-12-30 11:54:50', 'admin', 1, '9f/e59bbb814aa33.jpg', '123123', '2021-07-29 21:00:00', 1, 0, '', '', '', 'admin group', '', '123', '', 'ssssssssssssssssssssssss', 'vvvvvvvvvvv', 'fffffffffffffff', 'gggggggggggggggg', 'ttttttttttttttttttttttttt', 1, 1, 0, 1, 1, '', 'vvvvvvvvvvv', 'hidden_91d2g7', 'gggggggggggggggg', 'hidden_91d2g7', 0, 1, 0),
(2, 'guest', 2, 'nc_l4DFn76ds5yhg', '', 1, '', '2001-01-09 00:00:00', 3, 1, '2014-12-07 09:43:13', '', 0, '', '', '2021-10-06 10:22:23', 1, 1, '', '', '', 'guest group', 'guest', '', '', '', '', '', '', '', 1, 1, 1, 1, 1, '', '', '', '', 'guest@guest.guest', 0, 2, 0),
(3, 'user', 3, 'nc_l4DFn76ds5yhg', '', 1, '111', '2001-01-19 00:00:00', 2, 1, '2014-12-10 10:09:02', '', 1, '2e/44dafabea257a.jpg', '', '2021-07-29 21:00:00', 1, 0, '', '', '', 'user group', '', '', '', '222', '333', '', '', '', 1, 0, 1, 0, 1, '111', 'hidden_91d2g7', '', 'hidden_91d2g7', 'hidden_91d2g7', 0, 3, 0);

-- --------------------------------------------------------

--
-- Table structure for table `_user_roles`
--

DROP TABLE IF EXISTS `_user_roles`;
CREATE TABLE `_user_roles` (
  `id` int(15) NOT NULL,
  `_usersID` bigint(15) UNSIGNED NOT NULL DEFAULT 0,
  `_rolesID` bigint(15) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `_user_roles`
--

INSERT INTO `_user_roles` (`id`, `_usersID`, `_rolesID`) VALUES
(1, 1, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `docs`
--
ALTER TABLE `docs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`);

--
-- Indexes for table `_enums`
--
ALTER TABLE `_enums`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`);

--
-- Indexes for table `_enum_values`
--
ALTER TABLE `_enum_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `value` (`value`),
  ADD KEY `values_linker` (`values_linker`),
  ADD KEY `order` (`order`);

--
-- Indexes for table `_error_reports`
--
ALTER TABLE `_error_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`);

--
-- Indexes for table `_fields`
--
ALTER TABLE `_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `node_fields_linker` (`node_fields_linker`),
  ADD KEY `prior` (`prior`),
  ADD KEY `unique_field_in_section` (`node_fields_linker`,`fieldName`),
  ADD KEY `fieldType` (`fieldType`),
  ADD KEY `fieldName` (`fieldName`),
  ADD KEY `nodeRef` (`nodeRef`),
  ADD KEY `multilingual` (`multilingual`),
  ADD KEY `clientOnly` (`sendToServer`);

--
-- Indexes for table `_files`
--
ALTER TABLE `_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `file` (`file`);

--
-- Indexes for table `_filters`
--
ALTER TABLE `_filters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `_nodes__filters` (`node_filters_linker`),
  ADD KEY `_filters_name` (`name`),
  ADD KEY `_filters_view` (`view`),
  ADD KEY `_filters_order` (`order`);

--
-- Indexes for table `_filter_access_roles`
--
ALTER TABLE `_filter_access_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_filtersid` (`_filtersid`),
  ADD KEY `_rolesid` (`_rolesid`);

--
-- Indexes for table `_html`
--
ALTER TABLE `_html`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`);

--
-- Indexes for table `_languages`
--
ALTER TABLE `_languages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `languages_code` (`code`),
  ADD KEY `isUILanguage` (`isUILanguage`);

--
-- Indexes for table `_messages`
--
ALTER TABLE `_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `_receiverID` (`_receiverID`),
  ADD KEY `messagesID` (`messagesID`);

--
-- Indexes for table `_nodes`
--
ALTER TABLE `_nodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_nodesID` (`_nodesID`),
  ADD KEY `status` (`status`),
  ADD KEY `prior` (`prior`),
  ADD KEY `defaultFilterId` (`defaultFilterId`),
  ADD KEY `noStoreForms` (`storeForms`),
  ADD KEY `_nodes_nodeType` (`nodeType`);

--
-- Indexes for table `_organization`
--
ALTER TABLE `_organization`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_organizationID` (`_organizationID`);

--
-- Indexes for table `_organization_users`
--
ALTER TABLE `_organization_users`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `_usersID` (`_usersID`);

--
-- Indexes for table `_registration`
--
ALTER TABLE `_registration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_createdON` (`_createdON`),
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `_registration_activationKey` (`activationKey`);

--
-- Indexes for table `_roles`
--
ALTER TABLE `_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_organizationID` (`_organizationID`);

--
-- Indexes for table `_role_privileges`
--
ALTER TABLE `_role_privileges`
  ADD PRIMARY KEY (`roleID`,`nodeID`),
  ADD KEY `roleID` (`roleID`),
  ADD KEY `nodeID` (`nodeID`);

--
-- Indexes for table `_users`
--
ALTER TABLE `_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `name` (`name`),
  ADD KEY `_organizationID` (`_organizationID`),
  ADD KEY `firstName` (`firstName`),
  ADD KEY `lastName` (`lastName`),
  ADD KEY `midName` (`midName`),
  ADD KEY `public_phone` (`public_phone`),
  ADD KEY `language` (`language`);

--
-- Indexes for table `_user_roles`
--
ALTER TABLE `_user_roles`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `_usersID` (`_usersID`),
  ADD KEY `_rolesID` (`_rolesID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `docs`
--
ALTER TABLE `docs`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `_enums`
--
ALTER TABLE `_enums`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT for table `_enum_values`
--
ALTER TABLE `_enum_values`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT for table `_error_reports`
--
ALTER TABLE `_error_reports`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `_fields`
--
ALTER TABLE `_fields`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1009;

--
-- AUTO_INCREMENT for table `_files`
--
ALTER TABLE `_files`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `_filters`
--
ALTER TABLE `_filters`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `_filter_access_roles`
--
ALTER TABLE `_filter_access_roles`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `_html`
--
ALTER TABLE `_html`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT for table `_languages`
--
ALTER TABLE `_languages`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `_messages`
--
ALTER TABLE `_messages`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `_nodes`
--
ALTER TABLE `_nodes`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `_organization`
--
ALTER TABLE `_organization`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `_organization_users`
--
ALTER TABLE `_organization_users`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `_registration`
--
ALTER TABLE `_registration`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `_roles`
--
ALTER TABLE `_roles`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `_users`
--
ALTER TABLE `_users`
  MODIFY `id` bigint(15) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `_user_roles`
--
ALTER TABLE `_user_roles`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `docs`
--
ALTER TABLE `docs`
  ADD CONSTRAINT `_organizationID_docs` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`),
  ADD CONSTRAINT `creator_id_docs` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`);

--
-- Constraints for table `_enums`
--
ALTER TABLE `_enums`
  ADD CONSTRAINT `_organizationID_fk_1` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`),
  ADD CONSTRAINT `_userID_fk_2` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`);

--
-- Constraints for table `_enum_values`
--
ALTER TABLE `_enum_values`
  ADD CONSTRAINT `_organizationID_fk_4` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`),
  ADD CONSTRAINT `_userID_fk_5` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`),
  ADD CONSTRAINT `values_linker_fk_3` FOREIGN KEY (`values_linker`) REFERENCES `_enums` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `_error_reports`
--
ALTER TABLE `_error_reports`
  ADD CONSTRAINT `_organizationID_fk_6` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`),
  ADD CONSTRAINT `_userID_fk_7` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`);

--
-- Constraints for table `_fields`
--
ALTER TABLE `_fields`
  ADD CONSTRAINT `nodeRef_fk_8` FOREIGN KEY (`nodeRef`) REFERENCES `_nodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `node_fields_linker_fk_9` FOREIGN KEY (`node_fields_linker`) REFERENCES `_nodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `_files`
--
ALTER TABLE `_files`
  ADD CONSTRAINT `_organizationID_fk_10` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`),
  ADD CONSTRAINT `_userID_fk_11` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`);

--
-- Constraints for table `_filters`
--
ALTER TABLE `_filters`
  ADD CONSTRAINT `_nodes__filters_fk_14` FOREIGN KEY (`node_filters_linker`) REFERENCES `_nodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `_organizationID_fk_13` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `_userID_fk_12` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `_filter_access_roles`
--
ALTER TABLE `_filter_access_roles`
  ADD CONSTRAINT `_filter_access_roles_ibfk_1` FOREIGN KEY (`_filtersid`) REFERENCES `_filters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `_filter_access_roles_ibfk_2` FOREIGN KEY (`_rolesid`) REFERENCES `_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `_html`
--
ALTER TABLE `_html`
  ADD CONSTRAINT `_organizationID_fk_15` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `_userID_fk_16` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `_languages`
--
ALTER TABLE `_languages`
  ADD CONSTRAINT `_organizationID_fk_17` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`),
  ADD CONSTRAINT `_userID_fk_18` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`);

--
-- Constraints for table `_messages`
--
ALTER TABLE `_messages`
  ADD CONSTRAINT `_organizationID_fk_19` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `_userID_fk_20` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `_nodes`
--
ALTER TABLE `_nodes`
  ADD CONSTRAINT `_nodesID_fk_22` FOREIGN KEY (`_nodesID`) REFERENCES `_nodes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `defaultFilterId_fk_21` FOREIGN KEY (`defaultFilterId`) REFERENCES `_filters` (`id`);

--
-- Constraints for table `_organization`
--
ALTER TABLE `_organization`
  ADD CONSTRAINT `_organizationID_fk_23` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`);

--
-- Constraints for table `_registration`
--
ALTER TABLE `_registration`
  ADD CONSTRAINT `_organizationID__registration` FOREIGN KEY (`_organizationID`) REFERENCES `_organization` (`id`),
  ADD CONSTRAINT `creator_id__registration` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`);

--
-- Constraints for table `_roles`
--
ALTER TABLE `_roles`
  ADD CONSTRAINT `_userID_fk_26` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `_role_privileges`
--
ALTER TABLE `_role_privileges`
  ADD CONSTRAINT `nodID_fk_24` FOREIGN KEY (`nodeID`) REFERENCES `_nodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roleID_fk_25` FOREIGN KEY (`roleID`) REFERENCES `_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `_users`
--
ALTER TABLE `_users`
  ADD CONSTRAINT `language_fk_29` FOREIGN KEY (`language`) REFERENCES `_languages` (`id`);

--
-- Constraints for table `_user_roles`
--
ALTER TABLE `_user_roles`
  ADD CONSTRAINT `_rolesID_fk_28` FOREIGN KEY (`_rolesID`) REFERENCES `_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `_userID_fk_27` FOREIGN KEY (`_usersID`) REFERENCES `_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
