# reservation-domain

Module TypeScript orienté Domain-Driven Design (DDD) pour modéliser un service de réservation de places. Le projet a pour objectif de clarifier la séparation entre le métier, les cas d’usage, les événements de domaine et les mécanismes d’intégration, tout en restant facilement compréhensible à des fins pédagogiques.

## Vue d’ensemble

Ce dépôt vise à illustrer une architecture DDD simple et cohérente :

- les règles métier vivent dans le domaine ;
- les cas d’usage orchestrent les interactions entre objets du domaine ;
- les événements de domaine permettent de rendre explicites les changements d’état ;
- les handlers réagissent aux événements sans disperser la logique métier ;
- les repositories en mémoire permettent de tester le comportement sans dépendre d’une infrastructure externe.

Le projet s’inspire des principes de modélisation autour des “domain events” et des “reactions” décrits dans la littérature DDD, en les appliquant à un cas métier concret de réservation.

## Objectifs

- mettre en avant les principes du DDD dans un exemple compact ;
- distinguer clairement les objets métier, les entités, les value objects et les services applicatifs ;
- rendre les événements internes explicites et audités ;
- organiser le code selon une architecture claire en application / domain / infrastructure ;
- fournir un support pédagogique pour comprendre la logique de réservation dans une application métier ;
- proposer une base de tests fiable avec Vitest.

## Architecture

Le dépôt est structuré selon les couches classiques d’une application DDD :

```text
reservation-domain
├── src
│   ├── application
│   │   ├── CancelReservationUseCase.ts
│   │   ├── PlaceReservationUseCase.ts
│   │   └── ReservationApplicationService.ts
│   ├── domain
│   │   ├── Customer.ts
│   │   ├── CustomerId.ts
│   │   ├── EventDispatcher.ts
│   │   ├── Reservation.ts
│   │   ├── Seat.ts
│   │   ├── SeatId.ts
│   │   ├── types.d.ts
│   │   ├── __tests__
│   │   │   └── Reservation.test.ts
│   │   ├── handlers
│   │   │   ├── RecordAuditLogHandler.ts
│   │   │   ├── SendCancellationEmailHandler.ts
│   │   │   ├── SendConfirmationEmailHandler.ts
│   │   │   └── UpdateStatisticsHandler.ts
│   │   └── repositories
│   └── infrastructure
│       └── InMemoryReservationRepository.ts
├── AGENTS.md
├── ASSESSMENT.md
├── README.md
├── package.json
└── ...
```

### Couche application

La couche application contient les use cases et les orchestrateurs. Son rôle est limité :

- coordonner les opérations ;
- appliquer la logique de flux ;
- déléguer au domaine les décisions métier ;
- ne pas contenir la logique business complexe.

### Couche domain

La couche domain contient les concepts métier et les règles associées :

- entités comme les réservations et les clients ;
- value objects pour représenter des concepts nominaux et immuables ;
- événements de domaine ;
- dispatcher d’événements ;
- handlers de réaction au domaine.

### Couche infrastructure

La couche infrastructure donne une implémentation concrète des dépendances techniques, notamment les repositories en mémoire. Elle sert à rendre le système exécutable et testable sans dépendre d’une base de données externe.

## Fonctionnement

Le projet repose sur un cycle simple :

1. Une opération est déclenchée depuis un use case.
2. Le service applicatif coordonne l’appel et la transaction logique.
3. Les entités du domaine appliquent les règles métier.
4. Des événements de domaine sont émis lorsque le statut ou les données métier changent.
5. Les handlers enregistrés réagissent à ces événements pour faire des tâches annexes, comme :
   - enregistrement d’audit ;
   - envoi d’e-mails de confirmation ou d’annulation ;
   - mise à jour de statistiques.
6. Les repositories permettent de récupérer ou de persister l’état métier de façon abstraite.

L’intérêt majeur est de garder les événements de domaine distincts des commandes et des cas d’usage. Cela permet de rendre le système plus explicite, testable et évolutif.

## Installation

Prérequis :

- Node.js
- npm

Étapes :

```bash
npm install
```

Le dépôt est conçu pour être exécuté directement en local, sans configuration supplémentaire de base de données.

## Tests

Le projet utilise Vitest pour les tests unitaires. La stratégie de test est centrée sur le comportement métier et les règles de domaine, en évitant les tests trop couplés à l’implémentation technique.

Pour lancer la suite de tests :

```bash
npm run test
```

## Commandes

Le projet expose les commandes suivantes via package.json :

```bash
npm run test
```

Lance les tests Vitest.

```bash
npm run lint
```

Vérifie la qualité du code avec ESLint.

```bash
npm run prettier
```

Applique le formatage avec Prettier.

## Points clés du DDD dans ce dépôt

- Les règles métier restent dans le domaine et non dans les handlers.
- Les value objects apportent une représentation plus sûre et plus expressive des concepts métier.
- Les entités portent l’état métier et les comportements associés.
- Les évènements sont bien séparés des commandes.
- Les handlers ne font pas de logique métier : ils réagissent à une information déjà validée.
- Les repositories abstraient l’accès aux données, ce qui rend l’application plus testable.

## Contribution

Les contributions sont les bienvenues, à condition de rester cohérentes avec l’architecture du projet et les principes DDD.

Avant de proposer une modification :

- conserver la séparation application / domain / infrastructure ;
- garder les règles métier dans le domaine ;
- privilégier des événements métier explicites ;
- ajouter ou mettre à jour les tests associés ;
- vérifier que les commandes de validation passent :
  - `npm run test`
  - `npm run lint`
  - `npm run prettier`

La documentation et le code doivent rester lisibles et pédagogiques.

## Licence

Ce projet est publié sous la licence ISC.

---

Reservation-domain est un exemple pédagogique de modélisation DDD appliquée à la réservation de places. Son objectif est de montrer comment organiser un système métier autour des objets du domaine, des événements et des réactions, sans disperser la logique dans des couches techniques.