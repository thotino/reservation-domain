Oui. L'article met surtout l'accent sur une idée très concrète : **modéliser explicitement le fait métier, puis découpler les réactions à ce fait**. L'exercice doit donc t'obliger à distinguer *command*, *domain event*, *aggregate* et *handlers*, sans partir dans une architecture distribuée trop lourde. ([Denis Kyashif's Blog][1])

### Exercice — 🎟️ Système de réservation de places

Construis en **1 à 2 heures**, sans framework particulier, un petit système de réservation de places pour un événement.

Exemple : une salle de cinéma de 5 places.

```text
A1  A2  A3  A4  A5
```

Un utilisateur peut réserver une ou plusieurs places.

#### Fonctionnalités

Tu dois pouvoir faire :

```text
reserve(seatId, customerId)
cancelReservation(seatId)
```

Avec les règles :

* une place libre peut être réservée ;
* une place déjà réservée ne peut pas l'être ;
* une réservation annulée libère la place ;
* une réservation doit avoir un `customerId`.

Mais surtout, **ne t'arrête pas à la modification de l'état**.

---

## Les contraintes structurantes

Je te conseille de faire l'exercice avec **ces contraintes obligatoires**.

### 1. Les commandes ne sont pas des événements

Ton API/application service peut recevoir :

```text
ReserveSeat
CancelReservation
```

Mais ton domaine doit produire des événements comme :

```text
SeatReserved
ReservationCancelled
```

Les noms doivent exprimer **ce qui s'est passé**, au passé.

> `ReserveSeat` = intention
> `SeatReserved` = fait

C'est exactement la distinction centrale de l'article. ([Denis Kyashif's Blog][1])

---

### 2. L'aggregate produit lui-même ses événements

Crée par exemple :

```text
Reservation
```

ou, si tu préfères, un aggregate `Event`.

**Interdiction :** que ton application service fasse ça :

```text
reservation.reserve(...)
eventBus.publish(SeatReserved(...))
```

Le domaine doit plutôt ressembler à :

```text
reservation.reserve(...)
```

et cette opération doit :

1. vérifier l'invariant ;
2. modifier l'état ;
3. enregistrer `SeatReserved`.

Par exemple conceptuellement :

```text
reservation.events = [
    SeatReserved(...)
]
```

L'application ne fait ensuite que récupérer les événements produits.

C'est une contrainte importante de l'exercice : **le code qui décide qu'un fait est vrai est aussi celui qui enregistre ce fait.** ([Denis Kyashif's Blog][1])

---

### 3. Un événement est immutable

Un `SeatReserved` doit contenir suffisamment d'informations pour comprendre le fait :

```text
SeatReserved
    reservationId
    seatId
    customerId
    occurredAt
```

Une fois créé, personne ne le modifie.

---

### 4. Au moins 3 handlers indépendants

Lorsqu'un `SeatReserved` est produit, tu dois avoir **au moins trois réactions** :

```text
SeatReserved
    ├── SendConfirmation
    ├── RecordAuditLog
    └── UpdateStatistics
```

Par exemple :

```text
SendConfirmation
    -> "Email sent to customer 42"

RecordAuditLog
    -> "Seat A3 reserved by customer 42"

UpdateStatistics
    -> reservedSeats++
```

**Contrainte importante :**

> Aucun handler ne connaît les autres handlers.

Ils connaissent uniquement l'événement qu'ils consomment et leurs propres dépendances.

L'objectif est de retrouver la forme :

```text
fact
 ↓
 ├── reaction A
 ├── reaction B
 └── reaction C
```

plutôt que :

```text
reserve()
  ↓
sendEmail()
  ↓
writeAudit()
  ↓
updateStatistics()
```

C'est précisément le découplage que propose l'article. ([Denis Kyashif's Blog][1])

---

### 5. Construis un mini event dispatcher

Pas besoin de Kafka, RabbitMQ ou autre.

Fais simplement un dispatcher en mémoire :

```text
dispatch(event)
```

qui trouve les handlers correspondant à l'événement.

Par exemple :

```text
dispatcher.dispatch(SeatReserved(...))
```

doit déclencher les trois handlers.

---

### 6. Un handler doit pouvoir échouer

Ajoute volontairement un handler qui échoue dans certaines circonstances.

Par exemple :

```text
SendConfirmation
```

échoue pour `customerId == "broken-email"`.

Puis observe ce que fait ton dispatcher.

**Question à laquelle tu dois réfléchir :**

> Si `SendConfirmation` échoue, est-ce que `RecordAuditLog` doit quand même être exécuté ?

Ne cherche pas forcément à résoudre complètement le problème.

L'objectif est de **faire apparaître la question d'architecture** évoquée dans l'article : dispatch synchrone, isolation des erreurs, retry, outbox, etc. ([Denis Kyashif's Blog][1])

---

## Une contrainte supplémentaire que je te recommande

À la fin, ajoute un deuxième aggregate :

```text
SeatInventory
```

Lorsqu'un `SeatReserved` arrive, un handler demande à `SeatInventory` de réserver la place.

Donc :

```text
Reservation
    │
    │ SeatReserved
    ▼
ReserveSeatInInventory
    │
    ▼
SeatInventory.reserve(...)
```

Et `SeatInventory` peut à son tour produire :

```text
SeatReservedInInventory
```

Tu auras ainsi un petit aperçu du passage :

**Aggregate A → Event → Handler → Aggregate B → Event**

qui est une partie particulièrement intéressante de l'article. ([Denis Kyashif's Blog][1])

---

# Ce que tu dois volontairement NE PAS faire

Pour garder l'exercice à 1–2 h :

* ❌ pas de base de données ;
* ❌ pas de HTTP ;
* ❌ pas de framework ;
* ❌ pas de message broker ;
* ❌ pas d'async ;
* ❌ pas de CQRS complet ;
* ❌ pas d'Event Sourcing ;
* ❌ pas de système de retry sophistiqué.

Tout peut vivre en mémoire.

Le but est **le modèle**, pas l'infrastructure.

---

# Critères de réussite

À la fin, tu devrais pouvoir montrer ce scénario :

```text
ReserveSeat("A3", "alice")
        │
        ▼
 Reservation.reserve()
        │
        ├── vérifie l'invariant
        ├── modifie l'état
        └── produit SeatReserved
                    │
                    ▼
               Dispatcher
              /     |      \
             /      |       \
            ▼       ▼        ▼
       Email     Audit    Statistics
```

Et surtout, si demain on te demande :

> « Quand une place est réservée, on veut aussi envoyer une notification Slack. »

tu dois pouvoir ajouter :

```text
SendSlackNotification
```

**sans modifier `Reservation.reserve()` ni les handlers existants.**

C'est probablement le meilleur test de l'exercice : **est-ce que l'ajout d'une nouvelle conséquence nécessite de modifier le code qui représente le fait métier ?**

---

## Variante pour rendre l'exercice vraiment intéressant

À la fin de l'heure, prends ton propre code et pose-toi ces 5 questions :

1. **Qui décide que `SeatReserved` est vrai ?**
2. **Est-ce qu'un handler peut modifier directement l'état d'un autre aggregate ?**
3. **Que se passe-t-il si un handler échoue ?**
4. **Est-ce qu'un même événement peut être traité deux fois ?**
5. **Quels événements sont réellement utiles, et lesquels ne seraient que du bruit ?**

Ces questions correspondent assez directement aux points de conception de l'article : lieu où l'événement est produit, séparation des réactions, frontières d'aggregate, idempotence et retenue dans l'utilisation des événements. ([Denis Kyashif's Blog][1])

**Je te conseille de te donner une contrainte supplémentaire :** ne relis pas l'article pendant que tu codes. Fais l'exercice de mémoire, puis relis l'article à la fin et compare ton architecture à la sienne. C'est là que l'exercice devient vraiment formateur.

[1]: https://deniskyashif.com/2026/07/25/modeling-facts-and-reactions-with-domain-events/ "Modeling Facts and Reactions with Domain Events · Denis Kyashif's Blog"
