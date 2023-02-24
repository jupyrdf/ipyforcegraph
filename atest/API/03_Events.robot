*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Resource        ../_resources/keywords/Screenshots.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem

Force Tags      suite:colors    gh:36


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
ForceGraph Can Reheat
    Event Feature Works As Expected    ${IPYFORCEGRAPH CLASS}    reheat

ForceGraph3D Can Reheat
    Event Feature Works As Expected    ${IPYFORCEGRAPH CLASS 3D}    reheat


*** Keywords ***
Event Feature Works As Expected
    [Arguments]    ${widget_class}    ${feature}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}_${feature}
    Maybe Skip A Test    widget_class=${widget_class}    feature=${feature}
    Set Screenshot Directory    ${screens}
    Set Up Event Example    ${feature}    ${widget_class}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${before} =    Get Element Screenshot Size    ${frame}    ${screens}    01-original.png
    Wait For All Cells To Run
    Sleep    2s
    ${after} =    Get Element Screenshot Size    ${frame}    ${screens}    02-after.png
    Should Be True Or Screenshot    ${before} == ${after}    03-stable.png
    Add And Run JupyterLab Code Cell    fg.${feature}()
    Sleep    2s
    ${finally} =    Get Element Screenshot Size    ${frame}    ${screens}    04-finally.png
    Should Be True Or Screenshot    ${after} != ${finally}    05-event-changes.png
    [Teardown]    Clean Up Event Example

Set Up Event Example
    [Arguments]    ${feature}    ${widget_class}
    Set Tags    feature:${feature}    widget:${widget_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}Event.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Event Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
