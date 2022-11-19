package Automate;

import GPP.JSActions;
import GPP.PageObjects;
import GPP.Wait;
import org.openqa.selenium.*;
import org.testng.Assert;
import org.testng.annotations.Test;
import static GPP.WebDriver.chrome;



@Test
public class Sandbox {

    public void testHomePage() {
        //Set Chrome Webdriver Property Path
        System.setProperty("webdriver.chrome.driver", "C:\\Users\\Asus\\Desktop\\chromedriver.exe");

        //Navigate to URL

        chrome.manage().window().maximize();
        chrome.get("https://gpp.az/WebPortal/Infosite");

        //Verify Page Title
        String pageTitle = chrome.getTitle();
        Assert.assertEquals(pageTitle, "Hökumət Ödəniş Portalı");

        PageObjects Obyekt = new PageObjects();

        chrome.findElement(By.xpath("/html/body/div[1]/header/div/div[1]/div[1]/a/span")).click();

        JSActions.Yaz("1995060300045", Obyekt.modalLogin);
        JSActions.Yaz("BmDOLm6U",Obyekt.modalPassword);
        JSActions.Klik(Obyekt.modalEnter);

        chrome.findElement(By.id(Obyekt.OdenisElaveEt)).click();

        Wait.Gozle(Obyekt.DVX1);
        JSActions.Klik(Obyekt.DVX1);
        JSActions.Klik(Obyekt.DVX111126);
        JSActions.Klik(Obyekt.DVX2);
        JSActions.Klik(Obyekt.DVX111270);



    }
}
