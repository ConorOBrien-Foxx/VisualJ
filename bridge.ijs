require 'format/printf'

NB. TODO: unicode handling

cocurrent 'parse'
fmtlist =: ']' ,~ '[' , ',' joinstring ":&.>

trimleading =: ] #~ 1 - [: <./\ =
serializescalar =: [: hfd@(3&u:) LF joinstring a: trimleading [: (-.&CR)&.> LF cut '%J' sprintf <
serialize =: (dquote@,@serializescalar@":)`(fmtlist@(fmtlist@$ ; serialize&.>@,))@.(*@L.)

'STATUSOK STATUSERR' =: 0 1

NB. TODO: Allow the user to have HTML formatting output functions

parse =: {{
 NB. Check if any variables were defined
 NB. do local variables even work?
 NB. better support multi-line input(?)
 cocurrent 'base'
 namesbefore_parse_ =: <@(4!:1)"0 ] 0 1 2 3
 res_parse_ =: ".&.> a: -.~ <;._1 LF,y-.CR
 namesafter_parse_ =: <@(4!:1)"0 ] 0 1 2 3
 cocurrent 'parse'
 new =: namesafter (-.)&.>"0 namesbefore
 fin =: _1 pick res
 if. (0$0) -: fin do.
  NB. TODO: check verbs by value (e.g. `avg =: +/ % +` and then `avg =: +/ % #`)
  NB. TODO: is it possible to hook into `:=`?
  (serialize new) 1!:2 <'tmp.out'
  echo STATUSOK
 else.
  NB. We must use file output because 1!:2&4 (stdout) does not work at all in this context, and 1:2&2 (echo) truncates.
  (serialize fin) 1!:2 <'tmp.out'
  echo STATUSOK
 end.
 NB. required to suppress interactive output from the J shell
 0 0 $ 0
}}
