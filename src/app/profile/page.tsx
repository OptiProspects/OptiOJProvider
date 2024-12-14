'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon } from "lucide-react"
import { AvatarCropper } from '@/components/AvatarCropper'
import { uploadAvatar, removeAvatar, getUserData, getProvinces, getCities, updateProfile } from '@/lib/profileService'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PencilIcon, UploadIcon, TrashIcon } from "lucide-react"
import { getAvatar } from '@/lib/profileService'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { RatIcon, RabbitIcon, RibbonIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

const profileFormSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符").max(30, "用户名最多30个字符"),
  nickname: z.string().max(30, "姓名最多30个字符").optional(),
  gender: z.enum(["male", "female", "other"], {
    required_error: "请选择性别",
  }).optional(),
  birthday: z.date({
    required_error: "请选择出生日期",
  }).optional(),
  bio: z.string().max(200, "个性签名最多200个字符").optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  school: z.string().max(50, "学校名称最多50个字符").optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const [avatar, setAvatar] = useState("/placeholder-avatar.jpg")
  const [cropperOpen, setCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [provinces, setProvinces] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      nickname: "",
      birthday: undefined,
      school: "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData()
        const { user } = data
        const { profile } = user

        console.log('获取到的用户数据:', profile)

        // 处理生日日期
        let birthdayDate
        if (profile.birthday && profile.birthday !== "0001-01-01T00:00:00Z") {
          birthdayDate = new Date(profile.birthday)
        }

        // 如果有省份，先获取城市列表
        if (profile.province) {
          const citiesData = await getCities(profile.province)
          setCities(citiesData)
        }

        // 一次性设置所有表单数据
        form.reset({
          username: user.username,
          school: profile.school || "",
          bio: profile.bio || "",
          gender: profile.gender as "male" | "female" | "other" || undefined,
          birthday: birthdayDate,
          nickname: profile.real_name || "",
          province: profile.province || undefined,
          city: profile.city || undefined  // 确保设置城市值
        })

      } catch (error) {
        console.error('获取用户数据失败:', error)
        toast.error('获取用户数据失败')
      }
    }

    fetchUserData()
  }, [form])

  // 监听省份变化，自动获取对应的城市列表
  useEffect(() => {
    const province = form.getValues('province')
    if (province) {
      const fetchCities = async () => {
        try {
          const citiesData = await getCities(province)
          setCities(citiesData)
        } catch (error) {
          toast.error('获取城市列表失败')
        }
      }
      fetchCities()
    } else {
      // 如果没有省份，清空城市列表
      setCities([])
    }
  }, [form.watch('province')])

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces()
        setProvinces(data)
      } catch (error) {
        toast.error('获取省份列表失败')
      }
    }

    fetchProvinces()
  }, [])

  async function onSubmit(data: ProfileFormValues) {
    try {
      // 构建更新数据
      const updateData: any = {}
      
      if (data.bio) updateData.bio = data.bio
      if (data.gender) updateData.gender = data.gender
      if (data.birthday) updateData.birthday = data.birthday
      if (data.nickname) updateData.real_name = data.nickname
      if (data.school) updateData.school = data.school
      if (data.province) updateData.province = data.province
      if (data.city) updateData.city = data.city

      // 滤掉空值
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== '')
      )

      // 验证省市必须同时存在
      if ((filteredData.province && !filteredData.city) || (!filteredData.province && filteredData.city)) {
        toast.error('省份和城市必须同时选择')
        return
      }

      // 如果没有任何修改的字段
      if (Object.keys(filteredData).length === 0) {
        toast.info('未修改任何内容，无需保存哦 (～￣▽￣)～')
        return
      }

      await updateProfile(filteredData)
      toast.success('个人资料更新成功！')
    } catch (error) {
      toast.error('更新失败，请稍后重试')
      console.error('更新个人资料时出错:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
    event.target.value = ''
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      const response = await uploadAvatar(croppedBlob as File)
      setAvatar(response.avatarUrl)
      toast.success('头像上传成功')
    } catch (error) {
      toast.error('头像上传失败')
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      await removeAvatar()
      setAvatar("/placeholder-avatar.jpg")
      toast.success('头像删除成功')
    } catch (error) {
      toast.error('头像删除失败')
    }
  }

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await getAvatar()
        if (response.avatarUrl) {
          setAvatar(response.avatarUrl)
        }
      } catch (error) {
        console.error('获取头像失败:', error)
        setAvatar("/placeholder-avatar.jpg")
      }
    }

    fetchAvatar()

    // 清理函数
    return () => {
      if (avatar.startsWith('blob:')) {
        URL.revokeObjectURL(avatar)
      }
    }
  }, [])

  const handleProvinceChange = async (province: string) => {
    try {
      const citiesData = await getCities(province)
      setCities(citiesData)
      
      // 设置省份值
      form.setValue('province', province, {
        shouldValidate: true,
        shouldDirty: true,
      })
      
      // 清空城市值，因为省份改变后，之前的城市可能不��有效
      form.setValue('city', undefined, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      toast.error('获取城市列表失败')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料设置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="relative w-24 mx-auto">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatar} alt="头像" />
              <AvatarFallback>头像</AvatarFallback>
            </Avatar>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full shadow-md"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  上传头像
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteAvatar}>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  删除头像
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled 
                      placeholder="请输入用户名" 
                    />
                  </FormControl>
                  <FormDescription>
                    这是你的唯一标识，不可修改
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="请输入姓名" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      请输入您的真实姓名
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出生日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy年MM月dd日")
                            ) : (
                              <span>选择日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(year) => {
                              const newDate = new Date(field.value || new Date())
                              newDate.setFullYear(parseInt(year))
                              field.onChange(newDate)
                              // 强制 Calendar 更新到选中的年份
                              const calendarDate = new Date(newDate)
                              calendarDate.setDate(1)
                              setCalendarDate(calendarDate)
                            }}
                            value={field.value ? field.value.getFullYear().toString() : ""}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="选择年份" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {Array.from(
                                  { length: new Date().getFullYear() - 1900 + 1 },
                                  (_, i) => new Date().getFullYear() - i
                                ).map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}年
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>

                          <Select
                            onValueChange={(month) => {
                              const newDate = new Date(field.value || new Date())
                              newDate.setMonth(parseInt(month) - 1)
                              field.onChange(newDate)
                              // 强制 Calendar 更新到选中的月份
                              const calendarDate = new Date(newDate)
                              calendarDate.setDate(1)
                              setCalendarDate(calendarDate)
                            }}
                            value={field.value ? (field.value.getMonth() + 1).toString() : ""}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="选择��份" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                  <SelectItem key={month} value={month.toString()}>
                                    {month}月
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          month={calendarDate}
                          onMonthChange={setCalendarDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      您的出生日期将被保密
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>个性签名</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="介绍一下自己吧" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    最多200个字符
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>性别</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="male" id="male" className="peer sr-only" />
                        <Label
                          htmlFor="male"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <RatIcon className="mb-3 h-6 w-6" />
                          <span>男</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="female" id="female" className="peer sr-only" />
                        <Label
                          htmlFor="female"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <RabbitIcon className="mb-3 h-6 w-6" />
                          <span>女</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="other" id="other" className="peer sr-only" />
                        <Label
                          htmlFor="other"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <RibbonIcon className="mb-3 h-6 w-6" />
                          <span>其他</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所在院校</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="请输入您的学校名称" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    请填写您当前就读或毕业的学校
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所在省份</FormLabel>
                    <Select onValueChange={(value) => handleProvinceChange(value)} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择省份" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所在城市</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.getValues('province')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择城市" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">保存更改</Button>
          </form>
        </Form>

        <AvatarCropper
          open={cropperOpen}
          onClose={() => setCropperOpen(false)}
          imageUrl={selectedImage || ''}
          onCropComplete={handleCropComplete}
        />
      </CardContent>
    </Card>
  )
}
