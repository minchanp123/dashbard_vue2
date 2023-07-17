<template>
  <nav class="navbar navbar-vertical fixed-left navbar-expand-md navbar-light bg-white" id="sidenav-main">
    <div class="container-fluid">
      <slot></slot>
      <div v-show="$sidebar.showSidebar" class="navbar-collapse collapse show" id="sidenav-collapse-main"></div>
    </div>
  </nav>
</template>
<script>

export default {
  name: 'sidebar',

};
</script>
