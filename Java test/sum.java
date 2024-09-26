
import java.text.DecimalFormat;

public class sum {

    public static void main(String[] args) {

        double a = 40;
        double b = 80;
        double c = 40;
        double d = a / (b + c);        
        DecimalFormat df = new DecimalFormat("0.00");
        System.out.println(df.format(d));
    }
}
