# ПР2 «Автоматизоване Web-тестування»: аналіз Java-коду

Горіна К.С., група 554, ХАІ. Викладач: Ковалевський М. І.

Gradle-проєкт `javaintroduction` (Java, Gradle 8.10.2). Кожне завдання в окремому модулі, для кожного є оригінальний код з методички та виправлена версія.

| Модуль | Клас | Що всередині | Вивід |
|---|---|---|---|
| `task1` | `MyCode` | оригінальний код, активний рядок 1 | `Class A` |
| `task1` | `MyCodeAllLines` | рядки 1, 3, 4, 5 + виправлений рядок 6 `((B) ab).print2()` | `Class A`, `Class A`/`Class B` ×2, `Method from B`, `Print2` |
| `task1errors` | `MyCodeErrors` | рядки 2 і 6, які не компілюються | `incompatible types: A cannot be converted to B`, `cannot find symbol: method print2()` |
| `task2` | `SortTask` | оригінальний код (1 прохід бульбашки) | `12 13 17 23 19 23` (варіант 3) |
| `task2` | `SortTaskFixed` | повне бульбашкове сортування з прапорцем `swapped` | усі 5 тестових масивів відсортовані |
| `task3` | `Main` | оригінальний код (User без equals/hashCode) | `Failed!` |
| `task3` | `MainFixed` | User з перевизначеними `equals()` і `hashCode()` | `Passed!` |

Складність: оригінальне сортування O(n); виправлене O(n²) у середньому/найгіршому випадку, O(n) для вже відсортованого масиву.

Запуск: відкрити папку в IntelliJ IDEA / Android Studio і натиснути ▶ біля `main`.
