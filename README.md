# vue3-sync-modifier

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/vitejs-vite-es4rut)a# vue3 模板编译 —— 30 行代码实现 .sync 修饰符

> **🔴 v-bind 的 `.sync` 修饰符在 vue3 已移除**
>
> **🟢 但为了更深入的了解 `vue3` 模板编译 和 `AST`，所以我尝试用 `AST` 实现 `.sync` 修饰符**

**📄 vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { transformSync } from './transformSync'

export default defineConfig({
  plugins: [
    vue({
      template: { compilerOptions: { nodeTransforms: [transformSync] } }
    })
  ]
})
```

**📄 transformSync.ts**

```ts
import { createSimpleExpression, DirectiveNode, SimpleExpressionNode, TemplateChildNode } from '@vue/compiler-core'
import { remove } from '@vue/shared'

const ELEMENT = 1
const DIRECTIVE = 7

// 创建事件表达式
// e.g. @arg="exp"
const createEventExpression = (arg?: SimpleExpressionNode, exp?: SimpleExpressionNode) => ({ type: DIRECTIVE, name: 'on', arg, exp, loc: undefined, modifiers: [] } as unknown as DirectiveNode)

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
export function transformSync(node: TemplateChildNode) {
  if (node.type === ELEMENT) {
    const { props } = node
    for (let i = 0; i < props.length; i++) {
      const dir = props[i]
      // 判断属性是否有 sync 修饰符
      if (dir.type == DIRECTIVE && dir.modifiers.includes('sync')) {
        remove(dir.modifiers, 'sync')
        const { arg, exp } = dir
        // @update:xxxx
        const name = createSimpleExpression('update:' + arg?.loc.source, true)
        // value = $event
        const val = createSimpleExpression(exp?.loc.source + ' = $event')
        // 为元素添加 @update:xxx="value = $event"
        props.push(createEventExpression(name, val))
      }
    }
  }
}
```

🔺 以上就是完整代码了

`transformSync.ts` 文件去除注释后大概是 30 行代码

---

### 🎃 让我们来试试效果

```vue
<!-- MyButton.vue -->
<template>
  <button @click="$emit('update:count', count + 1)">count: {{ count }}</button>
</template>

<script setup lang="ts">
defineProps<{
  count: number
}>()
</script>
```

```vue
<!-- App.vue -->
<template>
  <my-button :count.sync="value" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyButton from './MyButton.vue'

const value = ref(0)
</script>
```

### 🚀 运行成功 😆

### [🚀 在线 StackBlitz 编辑](https://stackblitz.com/edit/vitejs-vite-es4rut?file=src%2FApp.vue&terminal=dev)

---

### 👍 点个赞吧 ✨ 👈
