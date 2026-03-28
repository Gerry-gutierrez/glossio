import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 })
    }

    // Validate file size (max 2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 })
    }

    // Use a fixed path per user so old avatars get replaced
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${user.id}/avatar.${ext}`

    // Delete any existing avatar files for this user
    const { data: existingFiles } = await supabase.storage
      .from('work-photos')
      .list(user.id, { search: 'avatar' })

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(f => `${user.id}/${f.name}`)
      await supabase.storage.from('work-photos').remove(filesToRemove)
    }

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('work-photos')
      .upload(filename, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('work-photos')
      .getPublicUrl(uploadData.path)

    // Add cache-busting param so browsers show the new image
    const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ avatarUrl })
  } catch (err) {
    console.error('Avatar upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
