/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Initialize all global variables.
 */

let all_languages;
let cur_lan_code = 'eng';
let cur_selected_class = 'popular';

let cur_class = 'popular'

let class_sidebar_bs = new bootstrap.Offcanvas($('#class-sidebar'));
let submit_dialog_bs = new bootstrap.Modal($('#submit-dialog'));