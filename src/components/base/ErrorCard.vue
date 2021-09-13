<script>
export default {
  name: "ErrorCard",
  props: {
    message: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      validator: category => {
        const validCategories = ["NEWS", "WEATHER", "FOOD"];
        return validCategories.includes(category);
      }
    }
  }
};
</script>

<template>
  <div class="card">
    <p>{{ message }}</p>
  </div>
</template>


<style>
</style>