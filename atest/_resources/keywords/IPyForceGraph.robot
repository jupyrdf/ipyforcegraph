*** Settings ***
Library     Collections
Library     XML    WITH NAME    XML
Library     OperatingSystem
Resource    ../variables/IPyForceGraph.robot


*** Keywords ***
Get All IPyForceGraph Example File Names
    ${file names} =    List Files in Directory    ${IPYFORCEGRAPH_EXAMPLES}
    RETURN    ${file names}

Get All IPyForceGraph Example Data Names
    ${file names} =    List Files in Directory    ${IPYFORCEGRAPH_EXAMPLES}${/}datasets
    RETURN    ${file names}

Get All IPyForceGraph Example Paths
    ${file names} =    Get All IPyForceGraph Example File Names
    ${paths} =    Create List
    FOR    ${file}    IN    @{file names}
        Append To List    ${paths}    ${IPYFORCEGRAPH_EXAMPLES}${/}${file}
    END
    RETURN    ${paths}

Get All IPyForceGraph Data Paths
    ${file names} =    Get All IPyForceGraph Example Data Names
    ${paths} =    Create List
    FOR    ${file}    IN    @{file names}
        Append To List    ${paths}    ${IPYFORCEGRAPH_EXAMPLES}${/}datasets${/}${file}
    END
    RETURN    ${paths}

Open IPyForceGraph Notebook
    [Arguments]    ${notebook}    ${path}=${IPYFORCEGRAPH_EXAMPLES}
    Set Tags    notebook:${notebook}
    ${full path} =    Normalize Path    ${path}${/}${notebook}.ipynb
    File Should Exist    ${full path}
    ${files} =    Get All IPyForceGraph Example Paths
    Copy Support Files    ${files}
    ${files} =    Get All IPyForceGraph Data Paths
    Copy Support Files    ${files}    ${/}datasets${/}
    Open File    ${full path}    ${MENU NOTEBOOK}
    Wait Until Page Contains Element    ${JLAB XP KERNEL IDLE}    timeout=30s
    Lab Command    Clear All Outputs
    Ensure Sidebar Is Closed
    Capture Page Screenshot    01-loaded.png

Copy Support Files
    [Arguments]    ${paths}    ${target}=${/}
    ${nb_dir} =    Get Jupyter Directory
    FOR    ${path}    IN    @{paths}
        ${parent}    ${name} =    Split Path    ${path}
        Copy File    ${path}    ${nb_dir}${target}${name}
    END

Example Should Restart-and-Run-All
    [Arguments]    ${example}
    Set Screenshot Directory    ${SCREENS}${/}${example.lower()}
    Execute JupyterLab Command    Show Log Console
    Open IPyForceGraph Notebook    ${example}
    # nothing should be on the page, yet
    Restart and Run All
    Wait Until Force Graph Is Visible
    Sleep    5s
    Capture All Code Cells
    Page Should Not Contain Standard Errors
    Capture Page Screenshot    10-ran-all-without-stderr.png

Wait Until Force Graph Is Visible
    [Arguments]    ${timeout}=60s
    Wait Until Page Contains Element    css:${IPYFORCEGRAPH FRAME}    timeout=${timeout}
    Sleep    1s

Clean up after IPyForceGraph Example
    Capture Page Screenshot    99-fin.png
    ${files} =    Get All IPyForceGraph Example File Names
    ${data} =    Get All IPyForceGraph Example Data Names
    Clean up after Working With Files    @{files}
    Clean up after Working With Files    @{data}
    Gently Reset Workspace

Click IPyForceGraph Canvas
    [Arguments]    ${x}=0    ${y}=0    ${text}=${EMPTY}
    Select Frame    css:${IPYFORCEGRAPH FRAME}
    Wait Until Page Contains Element    css:canvas    timeout=10s
    Click Element At Coordinates    css:canvas    ${x}    ${y}
    IF    '''${text}'''
        Wait Until Element Is Visible    css:${IPYFORCEGRAPH TOOLTIP}
        Element Should Contain    css:${IPYFORCEGRAPH TOOLTIP}    ${text}
    END
    [Teardown]    Unselect Frame

Wait Until Tag Widget Exists
    [Arguments]    ${text}    ${screenshot}=01-tagged.png
    Wait Until Element Is Visible    css:${CSS WIDGET TAG}
    Wait Until Element Contains    css:${CSS WIDGET TAG}    ${text}
    Capture Page Screenshot    ${screenshot}

Remove Widget Tag
    ${sel} =    Set Variable    css:${CSS WIDGET TAG} ${CSS WIDGET TAG CLOSE}
    Wait Until Page Contains Element    ${sel}
    Click Element    ${sel}

Wait Until No Tag Widgets Exist
    [Arguments]    ${screenshot}=02-not-tagged.png
    Wait Until Element Is Not Visible    css:${CSS WIDGET TAG}
    Capture Page Screenshot    ${screenshot}

Maybe Skip A Test
    [Documentation]    Capture common reasons for skipping tests
    [Arguments]    ${widget_class}=${EMPTY}    ${example}=${EMPTY}    ${feature}=${EMPTY}
    IF    "${OS}" == "Darwin"
        IF    "${feature}" in ["default_link_color", "default_node_color", "reheat"]
            Pass Execution    Can't test canvas feature on MacOS
            ...    skip:darwin:canvas
        END
        IF    "${widget_class}" == "${IPYFORCEGRAPH CLASS 3D}"
            Pass Execution    Can't test 3d canvas on MacOS
            ...    skip:darwin:3d
        END
    ELSE IF    "${OS}" == "Windows"
        IF    "${example}" == "${FORCES_TEST}"
            Pass Execution    Windows asyncio issues
            ...    skip:windows:asyncio
        END
    END
