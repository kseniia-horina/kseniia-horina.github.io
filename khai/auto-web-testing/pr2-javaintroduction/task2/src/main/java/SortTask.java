// Завдання 2: оригінальний код (один прохід бульбашкового сортування).
public class SortTask {
    public static void main(String[] args) {
        int[] values = {23, 12, 13, 17, 23, 19};

        for (int i = 0; i < values.length - 1; i++) {
            if (values[i] > values[i + 1]) {
                int t = values[i];
                values[i] = values[i + 1];
                values[i + 1] = t;
            }
        }
        for (int i :
                values) {
            System.out.println(i);
        }
    }
}
