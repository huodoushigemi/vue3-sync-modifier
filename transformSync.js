import { createSimpleExpression } from '@vue/compiler-core';
import { remove } from '@vue/shared';

const ELEMENT = 1;
const DIRECTIVE = 7;

// 创建事件表达式
// e.g. @arg="exp"
const createEventExpression = (arg, exp) => ({
  type: DIRECTIVE,
  name: 'on',
  arg,
  exp,
  loc: undefined,
  modifiers: [],
});

/**
 * 将 `.sync` 修饰符转换为 `@update:xxx`
 *
 * e.g.
 *
 * `<AAA :xxx.sync="value" />`
 *
 * ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
 *
 * `<AAA :xxx="value" @update:xxx="value = $event" />`
 */
export function transformSync(node) {
  if (node.type === ELEMENT) {
    const { props } = node;
    for (let i = 0; i < props.length; i++) {
      const dir = props[i];
      // 判断属性是否有 sync 修饰符
      if (dir.type == DIRECTIVE && dir.modifiers.includes('sync')) {
        remove(dir.modifiers, 'sync');
        const { arg, exp } = dir;
        // @update:xxxx
        const name = createSimpleExpression('update:' + arg.loc.source, true);
        // value = $event
        const val = createSimpleExpression(exp.loc.source + ' = $event');
        // 为元素添加 @update:xxx="value = $event"
        props.push(createEventExpression(name, val));
      }
    }
  }
}
