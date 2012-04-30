/**
 * @todo single icon to sort / reverse
 * @todo link the column-text to sort/reverse
 */

/**
 *
 * @option columnOptions:
 *      none: no sorting for this column
 *      header: links the column headline to sorting
 *      standard: inserts 2 signs which allow sorting
 */

(function($){
    "use strict"

    var defaults = {
        debug: false,
        columnOptions: [],
        preorder: null,
        columnsSelector: 'thead tr th',
        dataSelector: 'tbody tr'
    };

    var self;

    var columns = {}

    var options = {};

    var methods = {

        init: function (settings) {
            options = $.extend(defaults, settings);

            if (options.debug) {
                console.log('Init')
            }

            columns = $(this).find(options.columnsSelector);

            if (columns.size() == 0) {
                $.error('No columns found on instance with: ' + $(this).selector);
                return this;
            }
            self = $(this);

            if (options.debug) {
                console.log('Make sortable columns')
            }

            options.columnOptions = $(this).anothertablesorter('initColumnOptions', options.columnOptions);
            columns.each(function(element) {$(element).addClass('unsorted')});

            columns.each(function (pos) {
                $(this).anothertablesorter('makeSortableColumn', pos);
            });

            if (typeof(options.preorder) == 'object') {
                $(this).anothertablesorter('orderAfterColumn', options.preorder.column, options.preorder.direction);
            }

            return this;
        },

        initColumnOptions: function(columnOptions) {

            var validOptions = [];
            $.each(columns, function(pos) {

                validOptions[pos] = {
                    mode: 'standard',
                    sortCallback: null,
                    options: { }
                }

                if (columnOptions[pos] == false) {
                    validOptions[pos].mode = 'none';
                } else if (typeof(columnOptions[pos]) == 'object') {
                    $.extend(validOptions[pos], columnOptions[pos]);
                }
            });
            return validOptions;
        },

        makeSortableColumnStandard: function(i) {
            if (options.debug) {
                console.log('Making column ' + i + ' Sortable ("standard")');
            }
            
            var column = $(columns[i]);
            column.addClass('unsorted');
            column.addClass('sortable-column');
            
            // I ♥ utf-8 :)
            var columnSorter = column.append('<span class="sortable"><span class="ascending">↑</span><span class="descending">↓</span></span>');
            
            columnSorter.find('.ascending').click(
                function ()
                {
                    if (options.debug) {
                        console.log('Clicked sorting on column ' + i);
                    }
                    $(this).anothertablesorter('orderAfterColumn', i, 'ascending');
                }
            );
            columnSorter.find('.descending').click(
                function ()
                {
                    if (options.debug) {
                        console.log('Clicked sorting on column ' + i);
                    }
                    $(this).anothertablesorter('orderAfterColumn', i, 'descending');
                }
            );
        },

        makeColumnSortableHeader: function(i) {
            var column = $(columns[i]);
            if (options.debug) {
                console.log('Making column ' + i + ' Sortable ("column")');
            }
            var columnText = column.text();
            column.html('<span>' + columnText + '</span>')
            column.addClass('unsorted');
            column.addClass('sortable-column');
            column.click(
                function ()
                {
                    if (options.debug) {
                        console.log('Clicked sorting on column ' + i);
                    }
                    if ($(this).hasClass('unsorted') || $(this).hasClass('sorted-ascending')) {
                        $(this).anothertablesorter('orderAfterColumn', i, 'descending');
                    } else if ($(this).hasClass('sorted-descending')) {
                        $(this).anothertablesorter('orderAfterColumn', i, 'ascending')
                    }
                }
                );
        },

        makeSortableColumn: function (i)
        {
            switch(options.columnOptions[i].mode) {
                case 'header':
                    $(this).anothertablesorter('makeColumnSortableHeader', i);
                    break;
                case 'standard':
                    $(this).anothertablesorter('makeSortableColumnStandard', i);
                    break;
                case 'none':
                    if (options.debug) {
                        console.log('Dont make column ' + i + ' sortable')
                    }
                    break;
                default:
                    if (options.debug) {
                        console.log('Unknown columnMode "' + options.columnOptions[i].mode + '"')
                    }
            }
        },

        sortcallback: function(a,b, i, comparecallback) {
            var compA = $(a).find('td').eq(i).text();
            var compB = $(b).find('td').eq(i).text();

            if ( options.columnOptions[i].sortCallback ) {
                if (options.debug) {
                    console.log('Using sortcallback on column ' + i);
                }
                compA = options.columnOptions[i].sortCallback.apply(this, [compA]);
                compB = options.columnOptions[i].sortCallback.apply(this, [compB]);
            }
            return comparecallback.apply(this, [compA, compB]);
        },

        compareCallback: function(direction) {
            if (direction == 'descending')
            {
                return function(compA, compB) {
                    return (compA < compB) ? 1 : (compA > compB) ? -1 : 0;
                };
            } else if (direction == 'ascending')
            {
                return function(compA, compB) {
                    return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
                };
            }
            $.error('Invalid direction for compareCallback:' + direction);
            return false;
        },

        orderAfterColumn: function (i, direction)
        {
            var column = $(columns[i]);
            column.addClass('sorted-' + direction);
            column.removeClass('unsorted');
            if (direction == 'descending') {
                column.removeClass('sorted-ascending');
            } else {
                column.removeClass('sorted-descending');
            }

            if (options.debug) {
                console.log('Sorting column ' + i + '"' + direction + '"');
            }

            var data = $(self).find(options.dataSelector).get();

            data.sort(function (a,b) {
                return methods.sortcallback.apply(this, [a,b, i,methods.compareCallback(direction)])
            });

            $.each(data, function(pos, row) {
                $(self).append(row);
            });
        }
    }

    $.fn.anothertablesorter = function(method) {

        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.anothertablesorter' );
        }

        return this;
    };
})(jQuery);