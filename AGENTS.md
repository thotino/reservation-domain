# AGENTS

## Présentation du module

Ce module met en oeuvre le concept du domain driven development. Il s'inspire de l'article suivant: https://deniskyashif.com/2026/07/25/modeling-facts-and-reactions-with-domain-events/.

Le but est de construire un système simple de réservation de places. Il faut construire ce système en distinguant:
* les objets métiers
* les entités
* les services d'applications
* les évènements internes au domaine

Il faut s'assurer que tous les principes de DDD sont respectés:
* les règles métier vivent dans leurs domaines respectifs
* les value objects sont utilisés et apportent bien de la valeur ajouté
* les handlers font juste de l'orchestration
* les évènements sont nettement distincts des commandes

Dans le document [ASSESSMENT.md](./ASSESSMENT.md), se trouve le cas d'usage demandé avec les instructions qui ont permis de construire ce service.

## Structure du module
Ce module est structuré en 3 parties:
* **application**: elle contient les orchestateurs (handlers) ultra-légers
* **domain**: elle contient les value objects et les entités
* **infrastructure**: elle contient une implémentation concrète des classes de repository.

## Tests
Les tests sont effectués avec le framework `vitest`.
Les fichiers de tests vivent au plus près des fichiers testés dans un dossier intitulé `__tests__`.
Par exemple, les tests du module `/src/domain/Customer.ts` doivent être mis dans le dossier `/src/domain/__tests__/`

## Sous-agents
Des sous-agents existent dans ce repo. Ils sont disponibles dans le dossier `/.github/agents/`.
* `readme-specialist.agent.md` - pour l'écriture et la mise à jour du README
* `test-specialist.agent.md` - pour l'écriture et la mise à jour des tests unitaires
* `code-improver-specialist.agent.md` - pour analyser et améliorer le code écrit
* `git-specialist.agent.md` - pour le versioning des fichiers

## Gestion des modifications

Lorsqu'une modification est apporté, il faut impérativement s'assurer que les règles de linting sont respectés et que les tests passent.
* Lancer les tests unitaires avec la commande `npm run test`
* Vérifier le linter avec `npm run lint`
* Formatter le code avec `npm run prettier`
* Mettre à jour le README.md si besoin est