import Application from 'reproduce-component-event-handler-throws-testing-issues/app';
import config from 'reproduce-component-event-handler-throws-testing-issues/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
