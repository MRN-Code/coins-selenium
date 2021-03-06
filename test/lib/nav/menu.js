'use strict';

/**
 * menu.js shall not be called directly.  xxxMenu.js files shall require this file
 * to extend each particular menu's functionality
 *
 * e.g.
 * ```js
 * module.exports = function(client) {
 *     return require('./menu.js')(client, menuMap);
 * };
 */


module.exports = (client, menuMap) => {
  const me = {};

  // put menuMap in public scope
  me.menuMap = menuMap;

  me.findLink = (text) => {
    const findTextRecursive = (obj) => {
      if (obj.text === text) {
        return true;
      }
      if (obj.children) {
        return obj.children.some(findTextRecursive);
      }
      return false;
    };
    return menuMap.filter(findTextRecursive);
  };

  me.clickNested = (text) => {
    // Get top level menu item
    const parent = me.findLink(text)[0];
    // Ensure that top level menu item can be located
    if (!parent) {
      throw new Error(`could not locate menu item with text \`${text}\`.  Was it added to the menu map file?`);
    }

    // hover over top level menu item before clicking on child
    return client
      .element(`=${parent.text}`)
      .scroll()
      .click(`=${parent.text}`)
      .click(`=${text}`)
      .waitForPaginationComplete()
      .click('.site-header'); // Close the menu by clicking the banne
  };

  return me;
};
