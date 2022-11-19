package GPP;

import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import static GPP.WebDriver.chrome;
import org.openqa.selenium.By;

import java.time.Duration;

public class Wait {
    public static void Gozle (String Xpath){
        WebDriverWait wait = new WebDriverWait(chrome, Duration.ofSeconds(50));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(Xpath)));

    }
}
