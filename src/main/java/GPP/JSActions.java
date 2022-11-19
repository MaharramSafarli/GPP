package GPP;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;


import static GPP.WebDriver.chrome;


public class JSActions {

    public static void Yaz (String Yazi, String Xpath ){

        WebElement myElement = chrome.findElement(By.xpath(Xpath));
        String js = "arguments[0].setAttribute('value','"+Yazi+"')";
        ((JavascriptExecutor)chrome).executeScript(js,myElement);

    }

    public static void Klik (String Xpath){
        WebElement element = chrome.findElement(By.xpath(Xpath));
        JavascriptExecutor executor = (JavascriptExecutor) chrome;
        executor.executeScript("arguments[0].click();",element);
    }
}
