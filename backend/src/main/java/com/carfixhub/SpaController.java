package com.carfixhub;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({"/", "/admin", "/admin/"})
    public String index() {
        return "forward:/index.html";
    }
}
