<template>
  <div class="home-page">
    <HeroSection
      v-if="featuredMovie"
      :movie="featuredMovie"
      :genres="featuredGenres"
    />

    <!-- Trending Movies -->
    <MovieCarousel
      v-if="trendingMovies.length"
      title="Trending Movies"
      section-id="trending"
      :movies="trendingMovies"
    />

    <!-- Genre Filter Pills -->
    <section class="genre-filter container" v-if="genres.length">
      <button
        v-for="g in genreList"
        :key="g.slug"
        class="genre-filter__pill"
        :class="{ 'genre-filter__pill--active': activeGenre === g.slug }"
        @click="filterByGenre(g.slug)"
      >
        {{ g.name }}
      </button>
    </section>

    <!-- Filtered Movies by Genre -->
    <MovieCarousel
      v-if="filteredMovies.length"
      :title="activeGenreLabel"
      section-id="genre-filtered"
      :movies="filteredMovies"
      show-see-more
      see-more-link="/movies"
    />

    <!-- TV Series -->
    <MovieCarousel
      v-if="tvSeries.length"
      title="TV Series"
      section-id="tv-series"
      :movies="tvSeries"
      show-see-more
      see-more-link="/movies?type=TV_SERIES"
    />

    <!-- Latest Added -->
    <MovieCarousel
      v-if="latestMovies.length"
      title="Latest Added"
      section-id="latest"
      :movies="latestMovies"
      show-see-more
      see-more-link="/movies"
    />

    <!-- Empty state -->
    <div v-if="!loading && !allMovies.length" class="home-page__empty container">
      <div class="home-page__empty-card">
        <span class="home-page__empty-icon">🎬</span>
        <h2>Welcome to MovieLix</h2>
        <p>No movies added yet. Go to the Admin panel to add your first movie!</p>
        <NuxtLink to="/admin" class="btn btn-primary btn-lg">Go to Admin</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'MovieLix — Watch Movies in 1080p & 2K',
});

const loading = ref(true);
const allMovies = ref<any[]>([]);
const genres = ref<any[]>([]);
const activeGenre = ref('all');
const filteredMovies = ref<any[]>([]);

const genreList = computed(() => {
  return [{ name: 'All Popular', slug: 'all' }, ...genres.value];
});

const activeGenreLabel = computed(() => {
  if (activeGenre.value === 'all') return 'Popular';
  const g = genres.value.find((g: any) => g.slug === activeGenre.value);
  return g?.name || 'Popular';
});

const featuredMovie = computed(() => {
  return allMovies.value.find((m) => m.featured) || allMovies.value[0] || null;
});

const featuredGenres = computed(() => {
  return featuredMovie.value?.genres?.map((g: any) => g.name) || [];
});

const trendingMovies = computed(() => {
  return [...allMovies.value]
    .filter((m) => m.imdbRating)
    .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
    .slice(0, 20);
});

const tvSeries = computed(() => {
  return allMovies.value.filter((m) => m.type === 'TV_SERIES');
});

const latestMovies = computed(() => {
  return allMovies.value.slice(0, 20);
});

async function filterByGenre(slug: string) {
  activeGenre.value = slug;

  if (slug === 'all') {
    filteredMovies.value = [...allMovies.value]
      .filter((m) => m.imdbRating)
      .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
      .slice(0, 20);
    return;
  }

  try {
    const data = await $fetch<any>(`/api/movies?genre=${slug}&limit=20`);
    filteredMovies.value = data.movies || [];
  } catch {
    filteredMovies.value = [];
  }
}

onMounted(async () => {
  try {
    const [movieData, genreData] = await Promise.all([
      $fetch<any>('/api/movies?limit=50'),
      $fetch<any[]>('/api/movies/genres').catch(() => []),
    ]);
    allMovies.value = movieData.movies || [];
    genres.value = genreData || [];

    // Init filtered as popular
    filteredMovies.value = [...allMovies.value]
      .filter((m) => m.imdbRating)
      .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
      .slice(0, 20);
  } catch {
    // silently fail
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-page {
  padding-bottom: var(--space-16);
}

/* Genre Filter Pills */
.genre-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-6);
  padding-bottom: var(--space-2);
}

.genre-filter__pill {
  padding: 8px 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-hover);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.genre-filter__pill:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}

.genre-filter__pill--active {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border-color: var(--color-text-primary);
  font-weight: 600;
}

/* Empty state */
.home-page__empty {
  display: flex;
  justify-content: center;
  padding: var(--space-16) 0;
}

.home-page__empty-card {
  text-align: center;
  padding: var(--space-12);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  max-width: 460px;
}

.home-page__empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: var(--space-4);
}

.home-page__empty-card h2 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.home-page__empty-card p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}
</style>
