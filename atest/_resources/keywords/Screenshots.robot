*** Keywords ***
Get Element Screenshot Size
    [Arguments]    ${selector}    ${screens}    ${screen}
    Run Keyword And Ignore Error
    ...    Capture Element Screenshot    ${selector}    ${screen}
    ${size} =    Get File Size    ${screens}${/}${screen}
    RETURN    ${size}

Should Be True Or Screenshot
    [Arguments]    ${expr}    ${screenshot}
    IF    not ${expr}
        Capture Page Screenshot    ${screenshot}
        Should Be True    ${expr}
    END
