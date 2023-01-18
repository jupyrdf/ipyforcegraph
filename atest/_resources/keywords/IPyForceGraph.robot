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
    Open IPyForceGraph Notebook    ${example}
    # nothing should be on the page, yet
    Restart and Run All
    Wait Until Page Contains Element    ${IPYFORCEGRAPH GRAPH}    timeout=60s
    Sleep    5s
    Capture All Code Cells
    Page Should Not Contain Standard Errors
    Capture Page Screenshot    10-ran-all-without-stderr.png

Clean up after IPyForceGraph Example
    Capture Page Screenshot    99-fin.png
    ${files} =    Get All IPyForceGraph Example File Names
    ${data} =    Get All IPyForceGraph Example Data Names
    Clean up after Working With Files    @{files}
    Clean up after Working With Files    @{data}
