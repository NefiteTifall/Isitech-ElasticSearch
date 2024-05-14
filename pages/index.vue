<template>
	<div class="flex">
		<div class="left w-1/4 h-full gap-2 flex flex-col">
			<div v-for="candidate in candidates" :key="candidate"
			     class="flex items-center justify-between cursor-pointer gap-2 border min-w-fit shrink-0 w-full px-3 shrik py-1 pr-4 rounded">
<!--				<div class="flex items-center gap-2">
					<UAvatar
						size="md"
						:src="'/api/candidate?fullname=' + candidate"
						alt="Avatar"
					/>
					<p class="text-sm">{{ candidate }}</p>
				</div>
				<UCheckbox required/>-->
				<UCheckbox class="flex items-center cursor-pointer">
					<template #label>
						<div class="flex gap-2 cursor-pointer items-center">
							<UAvatar
								size="md"
								:src="'/api/candidate?fullname=' + candidate"
								alt="Avatar"
							/>
							<div>
								<p class="text-sm">{{ candidate }}</p>
								<p class="text-xs italic font-light">2516</p>
							</div>
						</div>
					</template>
				</UCheckbox>
			</div>
		</div>
		<div class="right w-3/4 h-full"></div>
	</div>
</template>
<script setup lang="ts">
</script>


<script>
export default {
	name: "Home",
	data() {
		return {
			candidates: ["Marine Le Pen", "Yannick Jadot", "Emmanuel Macron", "Anne Hidalgo", "Fabien Roussel"]
		};
	}
}
</script>
