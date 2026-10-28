import {test} from 'node:test';
import assert from 'node:assert';
import { priorityFor } from '../validation';
test('priority thresholds', () => {
    assert.equal(priorityFor(49999.99), 'low');
     assert.equal(priorityFor(50000), 'medium');
      assert.equal(priorityFor(99999.99), 'medium');
      assert.equal(priorityFor(100000), 'high');
      

});
