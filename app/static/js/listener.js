/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Listener functions.
 */

function languageSelectListenser() {
    let selected_lan_code = $('#language-select').find(':selected').val();
    switch_selected_language(selected_lan_code);
    render_page_basic(selected_lan_code);
//    render_class_display(selected_lan_code);
    render_all_prompt(selected_lan_code)
    render_class_tree(selected_lan_code);
    cur_lan_code = selected_lan_code;
}


function prompt_search_listener(){
    var search_text = $("#search-input").val();
    console.log(search_text);
    render_search_prompt_by_string(search_text, cur_lan_code)
}