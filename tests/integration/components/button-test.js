import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import click from '@ember/test-helpers/dom/click';
/* global QUnit */

module('Integration | Component | button', function (hooks) {
  setupRenderingTest(hooks);

  module('monkey-patch QUnit', () => {
    test('sync version', async function (assert) {
      // Neither `assert.rejects` nor `setupOnerror` utility provided by
      // `@ember/test-helpers` works for this case.
      //
      // 1. The `click('button')` does not reject with the error thrown by the
      //    component due to the click.
      // 2. I have no idea why `setupOnerror` is not working. For some reason
      //    the error seems not to go through Ember's error handling at all.
      //
      // The `ErrorEvent` passed to argument at QUnit's `onError` handler of
      // Qunit does not provide access to the error, which was not caught.
      // Therefore monkey-patching `QUnit.onError` similar to how we do it for
      // `QUnit.onUnhandledRejection` is not an option.
      //
      // All we can do is configure QUnit to ignore all errors. Sadly this
      // configuration interface is not even public API.
      QUnit.config.current.ignoreGlobalErrors = true;

      const expectedError = new Error();

      window.addEventListener('error', ({ error }) => {
        assert.step('error is thrown');
        assert.equal(error, expectedError);
      });

      this.set('clickHandler', () => {
        throw expectedError;
      });
      await render(hbs`<Button @onClick={{this.clickHandler}} />`);
      await click('button');

      assert.verifySteps(['error is thrown']);
    });

    test('async version', async function (assert) {
      const expectedError = new Error();

      // https://github.com/qunitjs/qunit/issues/1419#issuecomment-561739486
      const ORIG_QUNIT_UNHANDLED_REJECTION = QUnit.onUnhandledRejection;
      QUnit.onUnhandledRejection = (reason) => {
        if (reason === expectedError) {
          assert.step('error is thrown');
          assert.equal(reason, expectedError);
        } else {
          // QUnit should report all other unhandled rejections and mark
          // the test as failed
          return ORIG_QUNIT_UNHANDLED_REJECTION.call(QUnit, reason);
        }
      };

      this.set('clickHandler', async () => {
        throw expectedError;
      });
      await render(hbs`<Button @onClick={{this.clickHandler}} />`);
      await click('button');

      assert.verifySteps(['error is thrown']);
    });
  });

  module('setupOnError', () => {
    test('sync version', async function (assert) {
      const expectedError = new Error();

      setupOnerror((error) => {
        assert.step('error is thrown');
        assert.equal(error, expectedError);
      });

      this.set('clickHandler', () => {
        throw expectedError;
      });
      await render(hbs`<Button @onClick={{this.clickHandler}} />`);
      await click('button');

      assert.verifySteps(['error is thrown']);
    });

    test('async version', async function (assert) {
      const expectedError = new Error();

      setupOnerror((error) => {
        assert.step('error is thrown');
        assert.equal(error, expectedError);
      });

      this.set('clickHandler', async () => {
        throw expectedError;
      });
      await render(hbs`<Button @onClick={{this.clickHandler}} />`);
      await click('button');

      assert.verifySteps(['error is thrown']);
    });
  });

  module('assert.rejects', () => {
    test('sync version', async function (assert) {
      const expectedError = new Error();

      this.set('clickHandler', () => {
        throw expectedError;
      });
      await render(hbs`<Button @onClick={{this.clickHandler}} />`);
      assert.rejects(await click('button'));

      assert.verifySteps(['error is thrown']);
    });

    test('async version', async function (assert) {
      const expectedError = new Error();

      this.set('clickHandler', async () => {
        throw expectedError;
      });
      await render(hbs`<Button @onClick={{this.clickHandler}} />`);
      await assert.rejects(click('button'));

      assert.verifySteps(['error is thrown']);
    });
  });
});
