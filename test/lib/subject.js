'use strict';

const noop = require('lodash/noop');

module.exports = (client) => {
  const me = {
    new: {
      newUrsis: [],
    },
    enroll: {},
    lookup: {},
  };

  me.new.fillForm = (done = noop) => client
    .setValue('input[name=FirstName]', 'testFirstName')
    .setValue('input[name=MiddleName]', 'testMiddleName')
    .setValue('input[name=LastName]', 'testLastName')
    .setValue('input[name=Suffix]', 'testSuffix')
    .setValue('input[name=BirthDate]', '10/10/2010')
    .click('#GenderF')
    .setValue('input[name=Line1]', 'testAddressLine1')
    .setValue('input[name=Line2]', 'testAddressLine2')
    .setValue('input[name=City]', 'testCity')
    .selectByVisibleText('select[name=State]', 'AL - Alabama')
    .setValue('input[name=Zip]', 12345)
    .selectByVisibleText('select[name=Country]', 'United States')
    .setValue('#phone1_area_code', 123)
    .setValue('#phone2_area_code', 321)
    .setValue('#phone1_phone_num', 4567890)
    .setValue('#phone1_extension', 1111)
    .setValue('#phone2_extension', 2222)
    .setValue('#Notes', 'testNotes')
    .setValue('#email_address', 'testEmail@mrn.org')
    .selectByValue('#subject_tag_id', 1) // U.S. SSN
    .setValue('#value', 1112223333) // subject tag value
    .click('#context_site') // subject tag context === site
    .moveToObject('#study_id')
    .selectByValue('#study_id', 2319) // NITEST
    .alertDismiss((err) => {
      if (err) {
        /* eslint-disable no-console */
        console.warn('Study Enrollment limit OK - < 90% full');
        /* eslint-enable no-console */
      }
    })
    .waitForVis('#site_id', 8000)
    .moveToObject('#site_id')
    .selectByValue('#site_id', 7)
    .selectByVisibleText('select[name=ethnicity]', 'Unknown')
    .click('#racCat1')
    .click('#racCat2')
    .click('#racCat3')
    .click('#racCat4')
    .click('#racCat5')
    .moveToObject('#first_name_at_birth', (err) => {
      if (err) { return; } // not an RDoC study
      return client // eslint-disable-line consistent-return
        .setValue('#first_name_at_birth', 'testFirstNameAtBirth')
        .setValue('#middle_name_at_birth', 'testMiddleNameAtBirth')
        .setValue('#last_name_at_birth', 'testLastNameAtBirth')
        .click('#physical_sex_at_birth_f')
        .setValue('#city_born_in', 'testCityBornIn');
    })
    .setValue('#consent_date', '02/22/2015')
    .click('[name=agreestosharedata]') // selects the first matched radio (Yes)
    .click('[name=agrees_to_future_studies]') // selects the first matched radio (Yes)
    .call(done);

  me.new.submit = (done = noop) => client
    .pause(1000)
    .scroll('#submit_new_subject')
    .click('#submit_new_subject')
    .waitForPaginationComplete()
    .pause(100)
    .isExisting('[value="Add >"]', (err, isExisting) => {
      if (!isExisting) {
        throw new Error('Submit new subject did not detect that it made it to the verify page.');
      }
    })
    .call(done);

  me.new.verify = (done = noop) => client
    .pause(200)
    .moveToObject('[value="Add >"]')
    .click('[value="Add >"]')
    .waitForPaginationComplete()
    .call(done);

  /* eslint-disable no-underscore-dangle */
  me.new._handleSubjectMatchesClick = (done = noop) => client
    .pause(200)
    .moveToObject('#verify_add_new_subject')
    .click('#verify_add_new_subject')
    .pause(10)
    .call(done);

  me.new.handleSubjectMatchesAddNew = (done = noop) => me.new._handleSubjectMatchesClick()
    .isVisible('#confirm_new_participant_modal', (err, isVisible) => {
      if (isVisible) {
            // test that you can close and reopen
        client
          .click('#confirm_new_subject_declined')
          .isVisible('#confirm_new_subject_declined', (err2, isVisible2) => {
            if (isVisible2) {
              throw new Error('#confirm_new_subject_declined should not be visible');
            }
          })
          .moveToObject('#verify_add_new_subject')
          .click('#verify_add_new_subject')
          .pause(50)
          .click('#confirm_new_subject_confirmed');
      }
    })
    .waitForPaginationComplete()
    .pause(200)
    .isExisting('#new_ursi', (err, isExisting) => {
      if (!isExisting) {
        throw new Error('Submit verify subject did not detect that it made it to new URSI page.');
      }
    })
    .getText('#new_ursi', (err, textParam) => {
      const text = (textParam || '').trim();

      if (!text || text.charAt(0) !== 'M') {
        throw new Error('Unable to retrieve new URSI value.');
      }

      me.new.newUrsis.push(text);
    })
    .call(done);
  /* eslint-enable no-underscore-dangle */

  me.new.handleSubjectMatchesExisting = (done) => {
    client
      .scroll(0, 0)
      .setValue('.coins-datatable-wrapper input[type=search]', 'testaddressline1')
      .click('//*[@id="datatable-container"]/tbody/tr[1]/td[8]/a')
      .pause(500);

    // Create/Re-use
    if (Date.now() % 2 === 0) {
      client.click('input[type=button][value=\'Reuse URSI\']');
    } else {
      client.click('input[type=button][value=\'Create New URSI\']');
    }

    client
      .pause(1000)
      .click('input[type=button][value=Continue]')
      .call(done);
  };

  me.enroll.submitExisting = (done = noop) => client
    .pause(1000)
    .moveToObject('#enroll_subject_submit')
    .click('#enroll_subject_submit')
    .waitForPaginationComplete()
    // .scroll('.confirmMsg')
    .call(done);

  me.lookup.existing = (ursi, done = noop) => {
    if (!ursi) {
      throw new Error('subject.lookup.existing expects an ursi');
    }

    return client
      .pause(100)
      .setValue('input[name=ursi]', ursi)
      .click('[value="Continue >"]')
      .waitForPaginationComplete()
      .call(done);
  };

  return me;
};
