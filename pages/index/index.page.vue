<template>
  <h1>Welcome to Jeff's Test SSR site</h1>
  You are logged in as {{ pageContext.user?.name}} (OKTA Id: {{ pageContext.user?.sub }})
  <br />
  <br />
  <a href="/logout">Log Out</a>
</template>

<script lang="ts" setup>
import { PageContextCustom } from '../../renderer/types'
import { usePageContext } from '../../renderer/usePageContext'
const pageContext: PageContextCustom = usePageContext();
console.log(pageContext.user);
</script>
