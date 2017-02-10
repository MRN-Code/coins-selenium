'use strict';

const should = require('should');

// exports
module.exports = (client) => {
  const me = {};

  me.fillAsmtSearchCriteria = (details, done) => client
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

  me.clickAsmtResponsesButton = done => client
    .moveToObject('#asmt_grid>tbody>tr>td>a')
    .click('=responses')
    .waitForPaginationComplete(done);

  me.verifyAutoCalcResponseExists = done => client
    .getHTML('div#page', (err, html) => {
      // 1) grab html from the page
      // 2) search for 10.760204081633
      const n = html.search('10.760204081633');

      // 3) assert that the text we are searching for actually exists
      n.should.not.equal(-1);
    })
    .call(done);

  me.findAsmtConflict = (details, done) => {
    // TODO: this could be made more robust. As of now, it
    // just selects the first ("View") button, which is pretty brittle
    const selector = '#conflicts_table>tbody>tr>td>button';

    return client
      .setValue(
        'input[type=search]',
        `${details.ursi} ${details.assessmentDate} ${details.segmentInterval}`
      )
      .scroll(selector, -350, 0)
      .click(selector)
      .waitForPaginationComplete(done);
  };

  me.fixAndResolveConflict = done => client
    .click('input[value=">>>"]')
    .click('input[value="Resolve"]')
    .waitForPaginationComplete(done);

  me.downloadAsmt = done => client
    .click('input.select-all')
    .click('div#assessment-options')
    .click('input[id=dl_asmts]')
    // pause 7s to wait for download finish
    .pause(7000)
    .call(done);

  return me;
};
