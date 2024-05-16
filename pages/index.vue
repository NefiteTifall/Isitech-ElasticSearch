<template>
	<div class="gap-4 relative h-[calc(100%_-_48px)] flex">
		<div class="flex shrink w-1/4 gap-2 flex-col overflow-auto">
			<div class="flex border-gray-200 dark:border-gray-700">
				<UInput v-model="queryCandidates" placeholder="Rechercher"></UInput>
			</div>
			<div v-for="candidate in candidates" :key="candidate"
				class="flex items-center justify-between cursor-pointer gap-2 border min-w-fit rounded">
				<UCheckbox class="flex items-center cursor-pointer w-full px-3 py-1 pr-4" v-model="candidate.selected">
					<template #label>
						<div class="flex gap-2 cursor-pointer items-center w-full">
							<UAvatar size="lg" :src="'/api/candidates/image?fullname=' + candidate.key"
								:alt="candidate.key" />
							<div class="w-full">
								<p class="text-sm">{{ candidate.key }}</p>
								<p class="text-xs italic font-light">{{ candidate.doc_count }}</p>
							</div>
						</div>
					</template>
				</UCheckbox>
			</div>
		</div>
		<div class="flex shirnk w-3/4 gap-2 flex-col">
			<div class="flex border-gray-200 dark:border-gray-700">
				<UInput v-model="query" placeholder="Rechercher"></UInput>
			</div>
			<UTable :rows="tweets[pagination.page]" :columns="columns" :ui="{ 'td': { base: 'text-wrap' } }"
				class="overflow-auto border rounded h-[calc(100%_-_48px)]" style="overflow: auto" :loading="loading">
				<template #author-data="{ row }">
					<UTooltip :text="row.label" :popper="{ placement: 'top' }">
						<UAvatar size="lg" :src="'/api/candidates/image?fullname=' + row.author" :alt="row.author" />
					</UTooltip>
				</template>
				<template #content-data="{ row }">
					<p><a class="text-blue-500 text-xl" v-if="row.source" target="_blank" :href="row.source">
							<Icon name="material-symbols:attach-file"></Icon>
						</a> {{ row.content }}
					</p>
				</template>
				<template #empty-state>
					<div class="flex flex-col items-center justify-center py-6 gap-3">
						<span class="italic text-sm">
							Aucun tweet trouvé
						</span>
					</div>
				</template>
			</UTable>
			<div class="flex" :class="pagination.total == 0 ? 'justify-end' : 'justify-between'">
				<p class="text-primary" v-if="pagination.total != 0">
					{{ pagination.total }} tweets en {{ (pagination.took / 1000).toFixed(3) }}s
				</p>
				<div class="flex gap-2">
					<UButton icon="i-heroicons-chevron-left" size="sm"
						class="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium text-sm gap-x-1.5 p-1.5 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-900 dark:text-white bg-white hover:bg-gray-50 disabled:bg-white dark:bg-gray-900 dark:hover:bg-gray-800/50 dark:disabled:bg-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 inline-flex items-center first:rounded-s-md last:rounded-e-md rtl:[&_span:first-child]:rotate-180"
						aria-label="Précédent" square :disabled="pagination.page <= 1 || loading"
						@click="loadTweets(false, true)" />
					<UButton icon="i-heroicons-chevron-right" size="sm"
						class="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium text-sm gap-x-1.5 p-1.5 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-900 dark:text-white bg-white hover:bg-gray-50 disabled:bg-white dark:bg-gray-900 dark:hover:bg-gray-800/50 dark:disabled:bg-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 inline-flex items-center first:rounded-s-md last:rounded-e-md rtl:[&_span:first-child]:rotate-180"
						aria-label="Suivant" square
						:disabled="pagination.total == 0 || loading || pagination.page >= (pagination.total / pagination.rowsPerPage)"
						@click="loadTweets()" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Home",
	data() {
		return {
			candidates: [],
			loading: false,
			columns: [
				{ key: "author", label: "Author" },
				{ key: "content", label: "Content" },
				{ key: "date", label: "Date" }
			],
			pagination: {
				scrollId: null,
				page: 0,
				rowsPerPage: 20,
				total: 0,
				took: 0
			},
			query: "",
			queryCandidates: "",
			timeouts: {},
			tweets: {},
			newName: {
				"Jean Luc Melenchon": "Jean-Luc Mélenchon",
				"Eric Zemmour": "Éric Zemmour"
			},
			oldName: {
				"Jean-Luc Mélenchon": "Jean Luc Melenchon",
				"Éric Zemmour": "Eric Zemmour"
			}
		};
	},
	mounted() {
		this.loadCandidates();
	},
	methods: {
		loadTweets(reset = false, previous = false) {
			this.loading = true;

			if (reset) {
				this.pagination.scrollId = "";
				this.pagination.page = 0;
				this.tweets = {};
			}

			const candidates = this.candidates.filter((c) => c.selected).map((c) => c.key);
			candidates.forEach((candidate) => {
				if (this.oldName[candidate]) candidates.push(this.oldName[candidate]);
			});

			console.log("candidates", candidates);

			if (previous) {
				this.pagination.page--;
				this.loading = false;
				return;
			}

			this.pagination.page++;

			if (this.tweets[this.pagination.page]) {
				this.loading = false;
				return;
			}

			fetch(`/api/tweets?candidates=${candidates.join(",")}&pageSize=${this.pagination.rowsPerPage}&scrollId=${this.pagination.scrollId}&query=${this.query}`).then((res) => res.json()).then((data) => {
				console.log("tweets", data);

				this.tweets[this.pagination.page] = data.tweets.map(t => {
					let tweet = t._source;

					const text = tweet.text;
					const urlRegex = /(https?:\/\/[^\s]+)/;
					const match = text.match(urlRegex);

					let content, url;

					if (match) {
						url = match[0];
						content = text.replace(urlRegex, "").trim();
					} else content = text.trim();

					tweet.date = new Date(tweet.created_at).toLocaleString();
					tweet.content = content;
					tweet.source = url;
					tweet.author = this.newName[tweet.label] || tweet.label;

					return tweet;
				});

				this.pagination.scrollId = data.scrollId;
				this.pagination.total = data.total;
				this.pagination.took = data.took;
				this.loading = false;
			}).catch(err => {
				this.loading = false;
			});
		},
		loadCandidates() {
			fetch(`/api/candidates?query=${this.queryCandidates}`).then((res) => res.json()).then((data) => {
				console.log("candidates", data);

				data.forEach((candidate) => {
					if (this.newName[candidate.key]) candidate.key = this.newName[candidate.key];
				});

				data.sort((a, b) => a.key.localeCompare(b.key));

				this.candidates = data;
			});
		}
	},
	watch: {
		candidates: {
			deep: true,
			handler() {
				this.loadTweets(true, false);
			}
		},
		"query"() {
			clearTimeout(this.timeouts.query);

			this.timeouts.query = setTimeout(() => {
				this.loadTweets(true, false);
			}, 500);
		},
		"queryCandidates"() {
			clearTimeout(this.timeouts.queryCandidates);

			this.timeouts.queryCandidates = setTimeout(() => {
				this.loadCandidates();
			}, 500);
		}
	}
};
</script>
