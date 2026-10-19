import java.util.Arrays;

// Завдання 2: виправлене бульбашкове сортування (зовнішній цикл + прапорець swapped).
public class SortTaskFixed {

    static void bubbleSort(int[] values) {
        for (int pass = 0; pass < values.length - 1; pass++) {
            boolean swapped = false;
            for (int i = 0; i < values.length - 1 - pass; i++) {
                if (values[i] > values[i + 1]) {
                    int t = values[i];
                    values[i] = values[i + 1];
                    values[i + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;   // масив уже відсортований
        }
    }

    public static void main(String[] args) {
        int[][] tests = {
                {23, 12, 13, 17, 23, 19},
                {9, 8, 7, 6, 5, 4, 3, 2, 1},
                {5, -3, 0, 12, -7, 5},
                {1, 2, 3},
                {}
        };
        for (int[] values : tests) {
            String before = Arrays.toString(values);
            bubbleSort(values);
            System.out.println(before + " -> " + Arrays.toString(values));
        }
    }
}
