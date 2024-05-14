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
							<UAvatar
								size="lg"
								:src="'/api/candidates/image?fullname=' + candidate.key"
								:alt="candidate.key"
							/>
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
			<UTable :rows="tweets" :columns="columns" :ui="{ 'td': { base: 'text-wrap' } }" class="overflow-auto border rounded h-[calc(100%_-_48px)]" style="overflow: auto" :loading="loading">
				<template #author-data="{ row }">
					<UTooltip :text="row.label" :popper="{ placement: 'top' }">
						<UAvatar
							size="lg"
							:src="'/api/candidates/image?fullname=' + row.author"
							:alt="row.author"
						/>
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
						<span class="italic text-sm">No tweets to display</span>
					</div>
				</template>
			</UTable>
			<div class="flex justify-end">
				<UPagination v-model="pagination.page" :page-count="pagination.rowsPerPage" :total="pagination.total"/>
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
				page: 1,
				rowsPerPage: 20,
				total: 0
			},
			query: "",
			queryCandidates: "",
			timeouts: {},
			tweets: [],
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
		loadTweets() {
			this.loading = true;
			this.tweets = [];
			const candidates = this.candidates.filter((c) => c.selected).map((c) => c.key);
			candidates.forEach((candidate) => {
				if (this.oldName[candidate]) candidates.push(this.oldName[candidate]);
			});
			fetch(`/api/tweets?candidates=${ candidates.join(",") }&pageSize=${ this.pagination.rowsPerPage }&page=${ this.pagination.page }&query=${ this.query }`).then((res) => res.json()).then((data) => {
				console.log(data);
				this.tweets = data.tweets.map(t => {
					// Last word of text is source
					const text = t.text;
					const urlRegex = /(https?:\/\/[^\s]+)/;
					const match = text.match(urlRegex);
					let content, url;
					if (match) {
						url = match[0];
						content = text.replace(urlRegex, "").trim();
					} else content = text.trim();
					t.date = new Date(t.created_at).toLocaleString();
					t.content = content;
					t.source = url;
					t.author = this.newName[t.label] || t.label;
					return t;
				});
				this.pagination.total = data.total;
				setTimeout(() => {
					this.loading = false;
				}, 100);
			}).catch(err => {
				this.loading = false;
			});
		},
		loadCandidates() {
			fetch("/api/candidates").then((res) => res.json()).then((data) => {
				// If any key is "Jean Luc Melenchon", replace it with "Jean-Luc Mélenchon"
				data.forEach((candidate) => {
					if (this.newName[candidate.key]) candidate.key = this.newName[candidate.key];
				});

				// Short key
				data.sort((a, b) => a.key.localeCompare(b.key));
				this.candidates = data;
			});
		}
	},
	watch: {
		candidates: {
			deep: true,
			handler() {
				console.log(this.candidates);
				console.log("Enabled", this.candidates.filter((c) => c.selected).map((c) => c.key));
				this.pagination.page = 1;
				this.loadTweets();
			}
		},
		"pagination.page"() {
			this.loadTweets();
		},
		"query"() {
			clearTimeout(this.timeouts.query);
			this.timeouts.query = setTimeout(() => {
				this.loadTweets();
				this.pagination.page = 1;
			}, 500);
		},
		"queryCandidates"() {
			clearTimeout(this.timeouts.queryCandidates);
			this.timeouts.queryCandidates = setTimeout(() => {
				this.candidates = this.candidates.map((c) => {
					c.selected = c.key.toLowerCase().includes(this.queryCandidates.toLowerCase());
					return c;
				});
			}, 500);
		}
	}
};
</script>
