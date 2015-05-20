"use strict";
var should = require('should');
var _ = require('lodash');

// exports
module.exports = function(client, config) {
    var me = {};

    me.fillAsmtSearchCriteria = function(details, done) {
        return client
            .setValue('input[name=ursi]', details.ursi)
            .setValue('input[name=assessment_date]', details.assessmentDate)

            // click something to remove focus from assessment date
            // TODO: I dont like that you have to click something after filling
            // in a date in order to remove focus from the js date popup
            .click('[name=ownersOnly]') // selects the first matched radio (All data shared with this study)

            .selectByValue('[name="segment_interval"]', details.segmentInterval)
            .selectByValue('[name="entry_code"]', 'C')
            .selectByValue('[name="dataentry_type_id"]', details.dataEntryTypeId)
            .click('input[name=DoSearch]')
            .waitForPaginationComplete(done);
    };

    me.clickAsmtResponsesButton = function(done) {
        return client
            .moveToObject('#asmt_grid>tbody>tr>td>a')
            .click('=responses')
            .waitForPaginationComplete(done);
    };

    me.verifyAutoCalcResponseExists = function(done) {
        return client
            .getHTML('div.box-container>table', function(err, html) {
                var n;

                // 1) grab html from the second table on the page: html[1]
                // 2) search for 10.760204081633
                n = html[1].search('10.760204081633');

                // 3) assert that the text we are searching for actually exists
                n.should.not.equal(-1);
            })
            .call(done);

        // TODO: update above search function.  Possibly utilizing XPATH trickery...
        //XPATH goodness
        //$x('//*[contains(text(), "10.760204081633")]')
        //getText(BIG_XPATH_QUERY, function() { .. })

        // From: https://saucelabs.com/resources/the-selenium-click-command
        // selenium.click("xpath=//input[@name=myButton' and @type='submit']")
    };

    me.findAsmtConflict = function(details, done) {
        // TODO: this could be made more robust. As of now, it
        // just selects the first ("View") button, which is pretty brittle
        var selector = '#conflicts_table>tbody>tr>td>button';

        return client
            .setValue(
                'input[type=search]',
                details.ursi + ' ' + details.assessmentDate + ' ' + details.segmentInterval
            )
            .scroll(selector, -350, 0)
            .click(selector)
            .waitForPaginationComplete(done);
    };

    me.fixAndResolveConflict = function(done) {
        return client
            .click('input[value=">>>"]')
            .click('input[value="Resolve"]')
            .waitForPaginationComplete(done);
    };

    return me;

};
