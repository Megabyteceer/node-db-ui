if (typeof global === 'undefined') {
    window.global = window;
}
/// #if DEBUG
global.assert = function (condition, errorTxt) {
    if (!condition) {
        throwError(errorTxt);
    }
};
/// #endif
global.shouldBeAuthorized = function (userSession) {
    if (!userSession || userSession.__temporaryServerSideSession || isUserHaveRole(GUEST_ROLE_ID, userSession)) {
        throwError("operation permitted for authorized user only");
    }
};
global.isAdmin = function (userSession) {
    return isUserHaveRole(ADMIN_ROLE_ID, userSession);
};
global.isUserHaveRole = function (roleId, userSession) {
    if (!userSession && typeof (currentUserData) !== 'undefined') {
        userSession = currentUserData;
    }
    return userSession && userSession.userRoles[roleId];
};
global.getCurrentStack = function () {
    var a = new Error().stack.split('\n');
    a.splice(0, 3);
    return a;
};
global.ADMIN_ROLE_ID = 1;
global.GUEST_ROLE_ID = 2;
global.USER_ROLE_ID = 3;
global.FIELD_1_TEXT = 1;
global.FIELD_2_INT = 2;
global.FIELD_4_DATETIME = 4;
global.FIELD_5_BOOL = 5;
global.FIELD_6_ENUM = 6;
global.FIELD_7_Nto1 = 7;
global.FIELD_8_STATICTEXT = 8;
global.FIELD_10_PASSWORD = 10;
global.FIELD_11_DATE = 11;
global.FIELD_12_PICTURE = 12;
global.FIELD_14_NtoM = 14;
global.FIELD_15_1toN = 15;
global.FIELD_16_RATING = 16;
global.FIELD_17_TAB = 17;
global.FIELD_18_BUTTON = 18;
global.FIELD_19_RICHEDITOR = 19;
global.FIELD_20_COLOR = 20;
global.FIELD_21_FILE = 21;
global.PREVS_VIEW_OWN = 1;
global.PREVS_VIEW_ORG = 2;
global.PREVS_VIEW_ALL = 4;
global.PREVS_CREATE = 8;
global.PREVS_EDIT_OWN = 16;
global.PREVS_EDIT_ORG = 32;
global.PREVS_EDIT_ALL = 64;
global.PREVS_DELETE = 128;
global.PREVS_PUBLISH = 256;
global.PREVS_ANY = 65535;
if (typeof module !== 'undefined') {
    module.exports = { isUserHaveRole: isUserHaveRole, shouldBeAuthorized: shouldBeAuthorized, isAdmin: isAdmin, getCurrentStack: getCurrentStack };
}
//# sourceMappingURL=both-side-utils.js.map