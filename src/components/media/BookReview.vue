<script>
import { fetchBookDescription } from "@/media/sources";

// Open Library's trending books; a book's blurb is fetched the first time it's opened.
export default {
  name: "BookReview",
  props: {
    books: { type: Array, required: true }
  },
  data() {
    return { blurbs: {} }; // work key -> text | '' (none) | undefined (not asked yet)
  },
  methods: {
    async onToggle(book, event) {
      if (!event.target.open || book.key in this.blurbs) return;
      this.blurbs[book.key] = null; // loading
      try {
        this.blurbs[book.key] = await fetchBookDescription(book.key);
      } catch {
        this.blurbs[book.key] = "";
      }
    }
  }
};
</script>

<template>
  <ol class="chart">
    <li v-for="book in books" :key="book.key">
      <details class="m-item" @toggle="onToggle(book, $event)">
        <summary>
          <span class="m-item__rank">{{ book.rank }}</span>
          <img
            v-if="book.image"
            :src="book.image"
            alt=""
            loading="lazy"
            class="m-item__thumb books__cover"
          />
          <span class="m-item__text">
            <span class="m-item__title">{{ book.title }}</span>
            <span class="m-item__meta">{{ book.author }}</span>
          </span>
        </summary>
        <div class="m-item__body">
          <p v-if="blurbs[book.key] === null" class="m-item__meta">
            Fetching the jacket copy&hellip;
          </p>
          <p v-else-if="blurbs[book.key]" class="books__blurb">
            {{ blurbs[book.key] }}
          </p>
          <p class="m-item__meta">
            {{ [book.year && `First published ${book.year}`, book.editions && `${book.editions} editions`].filter(Boolean).join(" · ") }}
          </p>
          <a :href="book.url" target="_blank" rel="noopener">Read more on Open Library</a>
        </div>
      </details>
    </li>
  </ol>
</template>

<style lang="scss">
.books {
  &__cover {
    width: 40px;
    height: 60px;
  }
  &__blurb {
    display: -webkit-box;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-line;
  }
}
</style>
