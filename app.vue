<template>
	<NuxtLayout>
		<NuxtPage/>
	</NuxtLayout>

	<UNotifications/>
</template>


<style lang="scss">
* {
	/* La scrollbar elle-même */
	::-webkit-scrollbar {
		width: 12px; // Largeur de la scrollbar
		height: 12px; // Hauteur de la scrollbar pour les scrollbars horizontales
	}

	/* Le "track" (partie où la scrollbar se déplace) */
	::-webkit-scrollbar-track {
		background: #f1f1f1; // Couleur de fond du track
		border-radius: 6px; // Arrondi des coins du track
	}

	/* Le "thumb" (partie que l'on déplace) */
	::-webkit-scrollbar-thumb {
		background: #888; // Couleur de fond du thumb
		border-radius: 6px; // Arrondi des coins du thumb
		border: 2px solid #f1f1f1; // Bordure entre le thumb et le track

		&:hover {
			background: #555; // Couleur de fond du thumb au survol
		}
	}
}
</style>
