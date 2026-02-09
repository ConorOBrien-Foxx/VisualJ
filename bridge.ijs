require 'format/printf'

fmtlist =: ']' ,~ '[' , ',' joinstring ":&.>

trimleading =: ] #~ 1 - [: <./\ =
serializescalar =: [: hfd@(3&u:) LF joinstring a: trimleading [: (-.&CR)&.> LF cut '%J' sprintf <
serialize =: (dquote@,@serializescalar@":)`(fmtlist@(fmtlist@$ ; serialize&.>@,))@.(*@L.)

parse =: {{
 res =. ".&.> a: -.~ <;._1 LF,y-.CR
 fin =. _1 pick res
 if. (0$0) -: fin  do.
  stderr 'shit' NB. what if that's actually returned
  echo 1
 else.
  NB. We must use file output because 1!:2&4 (stdout) does not work at all in this context, and 1:2&2 (echo) truncates.
  (serialize fin) 1!:2 <'tmp.out'
  echo 0
 end.
 NB. required to suppress interactive output from the J shell
 0 0 $ 0
}}
